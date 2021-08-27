const service = require('./reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
/**
 * List handler for reservation resources
 */

 const validProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function hasProperties(req, res, next) {
  const { data = {} } = req.body;

  try {
    validProperties.forEach((property) => {
      if (!data[property]) {
        throw { status: 400, message: `A '${property}' property is required.` };
      }
    });
    next();
  } catch (err) {
    next(err);
  }
}

function hasValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const dateFormat = /\d\d\d\d-\d\d-\d\d/;
  const timeFormat = /\d\d:\d\d/;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );
    if (invalidFields.length) {
      return next({
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }
    if (typeof data.people !== "number" || data.people < 1) {
      return next({
        status: 400,
        message: "the people field must be a number",
      });
    }
    if (!data.reservation_date.match(dateFormat)) {
      return next({
        status: 400,
        message: "the reservation_date field must be a valid date",
      })
    }
    if (!data.reservation_time.match(timeFormat)) {
      return next({
        status: 400,
        message: "the reservation_time field must be a valid time",
      })      
    }
    next();
}

async function list(req, res) {
  const { date } = req.query;
  res.json({
    data: await service.listByDate(date),
  });
}

async function create(req, res, next) {
  const newReservation = await service.create(req.body.data);
  res.status(201).json({ data: newReservation });
}

module.exports = {
  create: [hasProperties, hasValidProperties, asyncErrorBoundary(create)],
  list: asyncErrorBoundary(list),
};