const service = require("./tables.service");
const wrapper = require("../errors/asyncErrorBoundary");
const reservation = require("../reservations/reservations.service");

const list = async (req, res, next) => {
  const tables = await service.list();
  res.json({ data: tables });
};

const checkId = async (req, res, next) => {
  const { table_id } = req.params;
  const data = await service.read(table_id);
  if (!data.length)
    return next({ status: 404, message: `Table ID: ${table_id} Not Found` });
  res.locals.table = data;
  next();
};

const read = async (req, res) => {
  res.json({
    data: res.locals.table,
  });
};

const create = async (req, res, next) => {
  const newTable = req.body.data;
  const table = await service.create(newTable);
  res.status(201).json({ data: table[0] });
};

const isValid = (req, res, next) => {
  const newTable = req.body.data;
  if (!newTable || !newTable.capacity || !newTable.table_name)
    return next({
      status: 400,
      message: `Invalid table parameters, table_name or capacity incorrect.`,
    });
  if (newTable.capacity < 1)
    return next({
      status: 400,
      message: `Must be able to accomodate atleast 1.`,
    });
  if (newTable.table_name.length < 2)
    return next({
      status: 400,
      message: `table_name must be atleast 2 characters.`,
    });
  next();
};

const update = async (req, res, next) => {
  const table_id = req.params.table_id;
  const reservation_id = req.body.data.reservation_id;
  let updated;
  try {
    updated = await service.update(table_id, reservation_id);
    await reservation.updateStatus(reservation_id, "seated");
  } catch (err) {
    next(err);
  }
  res.status(200).json({ data: updated });
};

const validUpdate = async (req, res, next) => {
  if (!req.body.data || !req.body.data.reservation_id)
    return next({
      status: 400,
      message: `No data or no reservation_id sent.`,
    });
  const reservation_id = await reservation.read(req.body.data.reservation_id);
  if (!reservation_id.length)
    return next({
      status: 404,
      message: `${req.body.data.reservation_id} not found`,
    });
  if (reservation_id[0].status === "seated")
    return next({
      status: 400,
      message: `${req.body.data.reservation_id} already seated`,
    });
  res.locals.reservation = reservation_id[0];
  next();
};

const validTable = async (req, res, next) => {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  const reservated = res.locals.reservation;
  if (table[0].occupied || reservated.people > table[0].capacity)
    return next({
      status: 400,
      message: `Over capacity or occupied`,
    });
  next();
};

const clearTable = async (req, res, next) => {
  const { table_id } = req.params;
  const reservationCheck = await service.read(table_id);
  const updated = await service.clearTable(table_id);
  await reservation.updateStatus(
    reservationCheck[0].reservation_id,
    "finished"
  );
  res.status(200).json({ data: updated });
};

const validClear = async (req, res, next) => {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  if (!table.length)
    return next({
      status: 404,
      message: `${table_id} not found`,
    });
  if (!table[0].reservation_id)
    return next({
      status: 400,
      message: `table ${table_id} is not occupied`,
    });
  next();
};

module.exports = {
  list: [wrapper(list)],
  read: [wrapper(checkId), wrapper(read)],
  create: [wrapper(isValid), wrapper(create)],
  update: [wrapper(validUpdate), wrapper(validTable), wrapper(update)],
  delete: [wrapper(validClear), wrapper(clearTable)],
};