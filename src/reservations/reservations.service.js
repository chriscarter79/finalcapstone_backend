const knex = require("../db/connection");

function create(reservation) {
	return knex("reservations")
		.insert(reservation)
		.returning("*")
		.then((createdRecords) => createdRecords[0]);
}

function listByDate(date) {
	return knex("reservations")
		.select("*")
		.where({ "reservations.reservation_date": date })
		.orderBy("reservations.reservation_time");
}

module.exports = {
	create,
	listByDate,
};
