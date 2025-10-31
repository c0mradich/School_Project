from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Users(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    password: str

class Rooms(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tables: int
    chairs: int
    photo: str