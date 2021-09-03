const service = require('./reservations.service')
const wrapper = require('../errors/asyncErrorBoundary')

const list = async (req, res) => {
  const { date, mobile_number } = req.query;
  if (date) {
    res.json({ data: await service.listByDate(date) });
  } else if (mobile_number) {
    res.json({ data: await service.search(mobile_number) });
  } else {
    res.json({ data: await service.list() });
  }
}

const read = async (req, res, next) => {
  const reservation = res.locals.reservation
  res.status(200).json({ data: reservation[0] })
}

const hasValidId = async (req, res, next) => {
  const id = req.params.reservation_Id
  const reservation = await service.read(id)
  if (!reservation.length)
    return next({ status: 404, message: `${id} not found` })
  res.locals.reservation = reservation
  next()
}

const isValid = (req, res, next) => {
  if (!req.body.data) return next({ status: 400, message: 'No date selected' })
  const { reservation_date, reservation_time, people, status } = req.body.data
  const requiredFields = [
    'first_name',
    'last_name',
    'mobile_number',
    'reservation_date',
    'reservation_time',
    'people',
  ]
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({ status: 400, message: `Invalid input for ${field}` })
    }
  }
  if (
    !reservation_date.match(/\d{4}-\d{2}-\d{2}/g) ||
    typeof people !== 'number' ||
    !reservation_time.match(/[0-9]{2}:[0-9]{2}/g)
  )
    return next({
      status: 400,
      message: `Invalid input for reservation_date, reservation_time, or people`,
    })
  if (status === 'seated')
    return next({ status: 400, message: 'status can not be seated!' })

  if (status === 'finished')
    return next({ status: 400, message: 'status can not be finished!' })

  res.locals.validReservation = req.body.data
  next()
}

const create = async (req, res, next) => {
  const newReservation = res.locals.validReservation
  const newRes = await service.create(newReservation)
  res.status(201).json({ data: newRes[0] })
}

const isFutureWorkingDate = (req, res, next) => {
  let newDate = new Date(
    `${req.body.data.reservation_date} ${req.body.data.reservation_time}`
  )
  const currentDay = new Date()
  if (newDate.getDay() === 2 || newDate.valueOf() < currentDay.valueOf())
    return next({
      status: 400,
      message: `You can only reserve for future dates and Restaurant is closed on Tuesdays`,
    })
  next()
}

const isDuringWorkingHours = (req, res, next) => {
  let time = Number(req.body.data.reservation_time.replace(':', ''))
  if (time < 1030 || time > 2130)
    return next({
      status: 400,
      message: `Reservations are only valid from 10:30 AM to 9:30 PM.`,
    })
  next()
}

const validateStatusUpdate = async (req, res, next) => {
  const currentStatus = res.locals.reservation[0].status
  const { status } = req.body.data

  if (currentStatus === 'finished')
    return next({
      status: 400,
      message: 'a finished reservation cannot be updated',
    })

  if (status === 'cancelled') return next()

  if (status !== 'booked' && status !== 'seated' && status !== 'finished')
    return next({ status: 400, message: 'Can not update unknown status' })

  next()
}

const updateStatus = async (req, res, next) => {
  const { reservation_Id } = req.params
  const status = req.body.data.status
  const data = await service.updateStatus(reservation_Id, status)

  res.status(200).json({
    data: { status: data[0] },
  })
}

const update = async (req, res, next) => {
  const { reservation_Id } = req.params
  const data = await service.update(reservation_Id, req.body.data)
  res.status(200).json({
    data: data[0],
  })
}

module.exports = {
  list: [wrapper(list)],
  read: [wrapper(hasValidId), wrapper(read)],
  create: [
    wrapper(isValid),
    wrapper(isFutureWorkingDate),
    wrapper(isDuringWorkingHours),
    wrapper(create),
  ],
  updateStatus: [
    wrapper(hasValidId),
    wrapper(validateStatusUpdate),
    wrapper(updateStatus),
  ],
  update: [
    wrapper(hasValidId),
    wrapper(isValid),
    wrapper(isFutureWorkingDate),
    wrapper(isDuringWorkingHours),
    wrapper(update),
  ],
}