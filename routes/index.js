import express from "express";
const router = express.Router();

import {
  registerController,
  loginController,
  userController,
  refreshController,
  busController,
  assignBusController,
  scheduleController,
  checkpointController,
  assignCheckpointController,
  assignBusToScheduleController,
  assignScheduleController,
  bookerController,
  passengerController,
  conductorController,
  seatController,
  bookingController,
  homeController,
} from "../controllers";
import { auth, notAuth, operator, admin } from "../middlewares";

// Dashboard landing page
router.get("/dashboard", auth, (req, res, next) => {
  const { user, refresh_token } = req.cookies["jwt"];
  res.render("opDashboard", { user, refresh_token });
});

// Dashboard buses
router.get("/dashboard/buses", [auth, operator], assignBusController.index);
router.get("/dashboard/addbus/", [auth, operator], busController.addbusPage);
router.get(
  "/dashboard/buses/update/:id",
  [auth, operator],
  busController.updatePage
);
router.get(
  "/dashboard/buses/delete/:id",
  [auth, operator],
  busController.destroy
);

router.get(
  "/dashboard/schedules",
  [auth, operator],
  assignScheduleController.index
);
router.get(
  "/dashboard/addschedule/",
  [auth, operator],
  scheduleController.addschedulePage
);
router.get(
  "/dashboard/schedules/update/:id",
  [auth, operator],
  scheduleController.updatePage
);
router.get(
  "/dashboard/schedules/delete/:id",
  [auth, operator],
  scheduleController.destroy
);

router.get(
  "/dashboard/checkpoints",
  [auth, operator],
  checkpointController.index
);
router.get(
  "/dashboard/addcheckpoint/",
  [auth, operator],
  checkpointController.addcheckpointPage
);
router.get(
  "/dashboard/checkpoints/update/:id",
  [auth, operator],
  checkpointController.updatePage
);
router.get(
  "/dashboard/checkpoints/delete/:id",
  [auth, operator],
  checkpointController.destroy
);

router.get(
  "/dashboard/buses/seats/:busId",
  [auth, operator],
  seatController.index
);
router.post(
  "/dashboard/buses/seats",
  [auth, operator],
  seatController.updateSeats
);
router.post("/dashboard/addseat/", seatController.store);
// router.get('/dashboard/seats/update/:id', [auth, operator], seatController.updatePage);
// router.get('/dashboard/seats/delete/:id', [auth, operator], seatController.destroy);

// Authentication
router.get("/register", registerController.registerPage);
router.post("/register", registerController.register);
// router.get('/login', loginController.loginPage);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.post("/refresh", auth, refreshController.refresh);
router.post("/logout/:token", auth, loginController.logout);
router.get(
  "/dashboard/changepassword",
  auth,
  loginController.changePasswordPage
);
router.post("/dashboard/changepassword", auth, loginController.changePassword);

// Bus
router.get("/buses", [auth, operator], busController.index);
router.post("/buses", [auth, operator], busController.store);
router.post("/buses/:id", [auth, operator], busController.update);
router.get("/buses/:id", [auth, operator], busController.show);
router.delete("/buses/:id", [auth, operator], busController.destroy);

// Assign Bus To Operator
router.post("/assignbuses", [auth, operator], assignBusController.store);
// router.get('/assignbuses', [auth, operator], assignBusController.index);
router.delete(
  "/assignbuses/:busId",
  [auth, operator],
  assignBusController.destroy
);

// Schedules
router.get("/schedules", [auth, operator], scheduleController.index);
router.post("/schedules", [auth, operator], scheduleController.store);
router.post("/schedules/:id", [auth, operator], scheduleController.update);
router.get("/schedules/:id", [auth, operator], scheduleController.show);
router.delete("/schedules/:id", [auth, operator], scheduleController.destroy);

// Checkpoints
router.get("/checkpoints", [auth, operator], checkpointController.index);
router.post("/checkpoints", [auth, operator], checkpointController.store);
router.get("/checkpoints/:id", [auth, operator], checkpointController.show);
router.post("/checkpoints/:id", [auth, operator], checkpointController.update);
router.delete(
  "/checkpoints/:id",
  [auth, operator],
  checkpointController.destroy
);

// Assign Checkpoints to Schedules
router.get(
  "/assigncheckpoints/:scheduleId",
  [auth, operator],
  assignCheckpointController.index
);
router.post(
  "/assigncheckpoints/:scheduleId",
  [auth, operator],
  assignCheckpointController.store
);
router.delete(
  "/assigncheckpoints/:scheduleId/:checkpointId",
  [auth, operator],
  assignCheckpointController.destroy
);

// Assign bus to schedule
router.get(
  "/assignbustoschedule/:scheduleId",
  [auth, operator],
  assignBusToScheduleController.index
);
router.post(
  "/assignbustoschedule/:scheduleId",
  [auth, operator],
  assignBusToScheduleController.store
);
router.delete(
  "/assignbustoschedule/:scheduleId/:busId",
  [auth, operator],
  assignBusToScheduleController.destroy
);

// Assign Schedule to operator
router.get(
  "/assignschedules",
  [auth, operator],
  assignScheduleController.index
);
router.post(
  "/assignschedules",
  [auth, operator],
  assignScheduleController.store
);
router.delete(
  "/assignschedules/:scheduleId",
  [auth, operator],
  assignScheduleController.destroy
);

// Booker
router.get("/bookers", bookerController.index);
router.post("/bookers", bookerController.store);
router.get("/bookers/:id", bookerController.show);
router.post("/bookers/:id", bookerController.update);
router.delete("/bookers/:id", bookerController.destroy);

// Passenger
router.get("/passengers", passengerController.index);
router.post("/passengers", passengerController.store);
router.get("/passengers/:id", passengerController.show);
router.put("/passengers/:id", passengerController.update);
router.delete("/passengers/:id", passengerController.destroy);

// Conductor
router.get(
  "/dashboard/conductors",
  [auth, operator],
  conductorController.index
);
router.get(
  "/dashboard/addconductor",
  [auth, operator],
  conductorController.createPage
);
router.post(
  "/dashboard/conductors",
  [auth, operator],
  conductorController.store
);
router.get(
  "/dashboard/conductors/:id",
  [auth, operator],
  conductorController.show
);
router.get(
  "/dashboard/conductors/update/:id",
  [auth, operator],
  conductorController.updatePage
);
router.post(
  "/dashboard/conductors/update/:id",
  [auth, operator],
  conductorController.update
);
router.delete(
  "/dashboard/conductors/:id",
  [auth, operator],
  conductorController.destroy
);

// Booking
router.get(
  "/dashboard/bookings/:page",
  [auth, operator],
  bookingController.index
);
router.post("/bookings", bookingController.store);
router.get("/bookings/:id", bookingController.show);
router.put("/bookings/:id", bookingController.update);
router.get(
  "/dashboard/bookings/delete/:id",
  [auth, operator],
  bookingController.destroy
);

// Booking routes
// Shows home page
router.get("/", homeController.homePage);
// shows available routes
router.get("/chooseroute", homeController.chooseRoute);
// select a route
router.post("/chooseroute", homeController.search, homeController.chooseRoute);
// show details of the bus of selected route
router.get("/schedules/buses/:busId", homeController.showBus);
// shows seats of the bus of selected routes
router.get("/selectseats/:scheduleId", homeController.selectSeats);
// confirms the selected seats
router.post("/booking/confirmseats", homeController.confirmSeat);
// enters the passengers and bookers details
router.get("/seats/booking", homeController.bookingPage);
// confirms booking information
router.post("/seats/booking", homeController.booking);
// shows the booking ticket information
router.get("/booking/confirmtickets", homeController.confirmTicket);
// redirects after successfull payment
router.get("/booking/payment_success", homeController.verifySuccess);
router.get("/booking/verified_success", homeController.paySuccess);
// redirects after payment failure
router.get("/booking/payment_failed", homeController.payFailure);

// print the ticket
router.post("/ticket/print", homeController.printTicket);
// show the ticket
router.get("/ticket/print", homeController.showTicket);
// print the reference ticket
router.get("/refticket/print", homeController.printRefTicket);

// Testing what after successful payment
router.post("/dashboard/testbooking", homeController.testbooking);
// Show tickets to print
router.get("/dashboard/testbooking", homeController.printTicketPage);

// Show reports
router.get("/dashboard/reports", homeController.showReport);
router.post("/dashboard/booking/reports", homeController.bookingReport);
// router.get('/dashboard/passengers/reports', homeController.showReport);
// router.get('/dashboard/booker/reports', homeController.showReport);

// Seats
// router.get('/seats', [auth, operator], seatController.index);
// router.post("/seats", seatController.store);
// router.get('/seats/:id', [auth, operator], seatController.show);
// router.post('/seats/:id', [auth, operator], seatController.update);
// router.delete('/seats/:id', [auth, operator], seatController.destroy);

export default router;
