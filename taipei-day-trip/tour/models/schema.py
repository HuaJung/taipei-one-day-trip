from tour.extensions import ma
from tour.extensions import datetime
from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError

# this file still under process


class User:
    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password
        self.time = datetime.now()

    def __repr__(self):
        return '<User(name={self.name!r}>'.format(self=self)


class UserSchema(ma.Schema):
    id = ma.Str(dump_only=True)
    name = ma.Str(required=True)
    email = ma.Email(required=True, validate=validate.Email(error='Not a valid email address'))
    password = ma.Str(required=True, validate=[validate.Length(min=6, max=36)])


class UserLoginSchema(ma.Schema):
    email = ma.Email(required=True, validate=validate.Email(error='Not a valid email address'))
    password = ma.Str(required=True, validate=[validate.Length(min=6, max=36)])


class UserRegisterSchema(ma.Schema):
    name = ma.Str(required=True)
    email = ma.Email(required=True, validate=validate.Email(error='Not a valid email address'))
    password = ma.Str(required=True, validate=[validate.Length(min=6, max=36)])


class BookingSchema(Schema):
    booking_id = fields.Str(dump_only=True)
    user_id = fields.Str(dump_only=True)
    attractionId = fields.Int(required=True)
    date = fields.Date(required=True)
    time = fields.Str(required=True)
    price = fields.Int(required=True)


class BookingAttractionSchema(Schema):
    attraction_id = fields.Str(required=True)
    date = fields.Date(required=True)
    time = fields.Str(required=True)
    price = fields.Int(required=True)

    @validates('date')
    def validate_date(self, value):
        today = datetime.today()
        if value <= today:
            raise ValidationError('cannot book today or the day before today')

    @validates('time')
    def validate_time(self, value):
        time = ['forenoon', 'afternoon']
        if value not in time:
            raise ValidationError('no such time available')

    @validates('price')
    def validate_price(self, value):
        price = [2000, 2500]
        if value not in price:
            raise ValidationError('price only has 2000 or 2500')


class Attraction:
    def __init__(self, att_id, name, category, description, address, transport, mrt, lat, lng, images):
        self.att_id = att_id
        self.name = name
        self.category = category
        self.description = description
        self.address = address
        self.transport = transport
        self.mrt = mrt
        self.lat = lat
        self.lng = lng
        self.images = images


class AttractionDetailSchema:
    class Meta:
        fields = ('id', 'name', 'category', 'description', 'address',
                  'transport', 'mrt', 'lat', 'lng', 'images')

class AttractionDataSchema(ma.Schema):
    class Meta:
        # fields to expose
        fields = ('nextPage', 'data')

    data = ma.Nested(AttractionDetailSchema)

