from flask import *
from tour.extensions import ma, date, re
from marshmallow import Schema, fields, validate, validates_schema, ValidationError, validates

# this file still under process

class UserSchema(Schema):
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True, validate=validate.Email(error='Not a valid email address'))
    password = fields.Str(required=True)
    phone = fields.Str(required=True)

    @validates_schema
    def validate_email_phone(self, data, **kwargs):
        errors = {}
        email_pattern = r'^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$'
        space_pattern = r'^\s*$'
        if re.match(email_pattern, data['email']) is None:
            errors['error'] = True
            errors['message'] = 'Not a valid email address'
            raise ValidationError(errors)
        if len(data['phone']) < 7 or len(data['phone']) > 25 or re.match(space_pattern, data['phone']):
            errors['error'] = True
            errors['message'] = 'Not a valid phone number'
            raise ValidationError(errors)

    @validates('password')
    def validate_password(self, value):
        errors = {}
        space_pattern = r'^\s*$'
        if len(value) < 3 or len(value) > 30 or re.match(space_pattern, value):
            errors['error'] = True
            errors['message'] = 'invalid password'
            raise ValidationError(errors)


# create attraction schema with defining fields
class AttractionSchema(Schema):
    id = fields.Int(required=True)
    name = fields.Str(required=True)
    address = fields.Str(required=True)
    image = fields.Str(required=True)


class BookingSchema(Schema):
    booking_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    attractionId = fields.Int(required=True)
    date = fields.Date(required=True)
    time = fields.Str(required=True)
    price = fields.Int(required=True)


class BookingAttractionSchema(Schema):
    attractionId = fields.Int(required=True)
    date = fields.Date(required=True)
    time = fields.Str(required=True)
    price = fields.Int(required=True)

    @validates_schema
    def validate_date_time_price(self, data, **kwargs):
        errors = {}
        today = date.today()
        time_price = {'forenoon': 2000, 'afternoon': 2500}
        if data['date'] <= today:
            errors['error'] = True
            errors['message'] = 'cannot book today or the day before today'
            raise ValidationError(errors)
        if time_price.get(data['time']) != data['price']:
            errors['error'] = True
            errors['message'] = 'time or price not valid'
            raise ValidationError(errors)


class TripSchema(Schema):
    attraction = fields.Nested(AttractionSchema)
    date = fields.Date(required=True)
    time = fields.Str(required=True)


class OrderDetailSchema(Schema):
    price = fields.Int(required=True)
    trip = fields.Nested(TripSchema)
    contact = fields.Nested(UserSchema, only=('name', 'email', 'phone'))


class OderSchema(Schema):
    prime = fields.Str(required=True)
    order = fields.Nested(OrderDetailSchema)



# ------------------------below schema not done yet----------------------

class User:
    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password
        self.time = datetime.now()

    def __repr__(self):
        return '<User(name={self.name!r}>'.format(self=self)


class UserLoginSchema(ma.Schema):
    email = ma.Email(required=True, validate=validate.Email(error='Not a valid email address'))
    password = ma.Str(required=True, validate=[validate.Length(min=6, max=36)])


class UserRegisterSchema(ma.Schema):
    name = ma.Str(required=True)
    email = ma.Email(required=True, validate=validate.Email(error='Not a valid email address'))
    password = ma.Str(required=True, validate=[validate.Length(min=6, max=36)])


# attraction model
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




