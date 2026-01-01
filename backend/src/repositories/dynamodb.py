from functools import lru_cache
from typing import Any

import boto3
from boto3.dynamodb.conditions import Key

from src.core.config import Settings, get_settings


class DynamoDBClient:
    """
    Single Table Design for DynamoDB

    Table Structure:
    - PK: USER#{userId} or GOAL#{goalId}
    - SK: GOAL#{goalId} or MILESTONE#{milestoneId}
    - type: "goal" or "milestone"

    Access Patterns:
    - Get all goals for a user: PK = USER#{userId}, SK begins_with GOAL#
    - Get a specific goal: PK = USER#{userId}, SK = GOAL#{goalId}
    - Get all milestones for a goal: PK = GOAL#{goalId}, SK begins_with MILESTONE#
    - Get a specific milestone: PK = GOAL#{goalId}, SK = MILESTONE#{milestoneId}
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.table_name = settings.dynamodb_table_name

        dynamodb_kwargs: dict[str, Any] = {
            "region_name": settings.aws_region,
        }
        if settings.dynamodb_endpoint_url:
            dynamodb_kwargs["endpoint_url"] = settings.dynamodb_endpoint_url

        self.dynamodb = boto3.resource("dynamodb", **dynamodb_kwargs)
        self.table = self.dynamodb.Table(self.table_name)

    def put_item(self, item: dict[str, Any]) -> None:
        self.table.put_item(Item=item)

    def get_item(self, pk: str, sk: str) -> dict[str, Any] | None:
        response = self.table.get_item(Key={"PK": pk, "SK": sk})
        return response.get("Item")

    def query(
        self,
        pk: str,
        sk_prefix: str | None = None,
        sk_value: str | None = None,
    ) -> list[dict[str, Any]]:
        key_condition = Key("PK").eq(pk)

        if sk_value:
            key_condition = key_condition & Key("SK").eq(sk_value)
        elif sk_prefix:
            key_condition = key_condition & Key("SK").begins_with(sk_prefix)

        response = self.table.query(KeyConditionExpression=key_condition)
        return response.get("Items", [])

    def update_item(
        self,
        pk: str,
        sk: str,
        updates: dict[str, Any],
    ) -> dict[str, Any]:
        update_expression_parts = []
        expression_attribute_names = {}
        expression_attribute_values = {}

        for i, (key, value) in enumerate(updates.items()):
            attr_name = f"#attr{i}"
            attr_value = f":val{i}"
            update_expression_parts.append(f"{attr_name} = {attr_value}")
            expression_attribute_names[attr_name] = key
            expression_attribute_values[attr_value] = value

        update_expression = "SET " + ", ".join(update_expression_parts)

        response = self.table.update_item(
            Key={"PK": pk, "SK": sk},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW",
        )
        return response.get("Attributes", {})

    def delete_item(self, pk: str, sk: str) -> None:
        self.table.delete_item(Key={"PK": pk, "SK": sk})

    def batch_write(self, items: list[dict[str, Any]]) -> None:
        with self.table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)

    def batch_delete(self, keys: list[tuple[str, str]]) -> None:
        with self.table.batch_writer() as batch:
            for pk, sk in keys:
                batch.delete_item(Key={"PK": pk, "SK": sk})


@lru_cache
def get_dynamodb_client() -> DynamoDBClient:
    return DynamoDBClient(get_settings())
