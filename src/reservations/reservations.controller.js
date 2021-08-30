const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
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
  validProperties.forEach((property) => {
    if (!data[property]) {
      const error = new Error(`A '${property}' property is required.`);
      error.status = 400;
      return next(error);
    }
  });
  next();
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
  if (typeof data.people != "number" || data.people < 1) {
    return next({
      status: 400,
      message: "the people field must be a number",
    });
  }
  if (!data.reservation_date.match(dateFormat)) {
    return next({
      status: 400,
      message: "the reservation_date field must be a valid date",
    });
  }
  if (!data.reservation_time.match(timeFormat)) {
    return next({
      status: 400,
      message: "the reservation_time field must be a valid time",
    });
  }
  next();
}

function hasValidDate(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const invalidDate = 2;
  const submitDate = new Date(reservation_date + ' ' + reservation_time);
  const dayAsNum = submitDate.getDay();
  const today = new Date();

  if (!reservation_date) {
    next({
      status: 400,
      message: `Please select a date.`,
    });
  }
  if (submitDate < today) {
    next({
      status: 400,
      message: `The date and time has to be in the future. Today is ${today}.`,
    });
  }
  if (dayAsNum === invalidDate) {
    next({
      status: 400,
      message: `The restaurant is closed on Tuesdays. Please select a different day.`,
    });
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
  create: [hasProperties, hasValidProperties, hasValidDate, asyncErrorBoundary(create)],
  list: asyncErrorBoundary(list),
};