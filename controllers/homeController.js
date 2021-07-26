import {
  Schedule,
  Bus,
  AssignBusToSchedule,
  Checkpoint,
  AssignSeat,
  AssignCheckpoint,
  Booker,
  Passenger,
  Booking,
} from "../models";
import mongoose from "mongoose";

const fs = require("fs");
var pdf = require("pdf-creator-node");
const path = require("path");
const url = require("url");

const homeController = {
  homePage: async (req, res, next) => {
    let checkpoints = [];
    console.log("homepage");
    try {
      const data = await Checkpoint.find();
      data.forEach((d) => {
        checkpoints.push(d.checkpoint);
      });
    } catch (err) {
      console.log("err :>> ", err);
    }
    res.render("home", { checkpoints });
  },

  search: async (req, res, next) => {
    let { depart, pickup, dropoff } = req.body;
    pickup = pickup.toLowerCase();
    dropoff = dropoff.toLowerCase();

    let schedules = await Schedule.find({ depart, pickup, dropoff });

    const mappedArr = schedules.map(async (sch) => {
      const {
        _id,
        depart,
        arrival,
        departTime,
        arrivalTime,
        pickup,
        dropoff,
        price,
      } = await Schedule.findOne({ _id: sch });
      const { schedule, bus } = await AssignBusToSchedule.findOne({
        schedule: sch,
      }).select("-__v -updatedAt");

      const { busName, busNo } = await Bus.findOne({ _id: bus });

      return {
        _id,
        depart,
        arrival,
        pickup,
        departTime,
        arrivalTime,
        dropoff,
        price,
        schedule,
        bus,
        busName,
        busNo,
      };
    });
    let documents = await Promise.all(mappedArr);

    req.dataProcessed = documents;
    res.cookie("schedules", documents);
    return next();
    // return res.redirect('/api/chooseroute/?valid=' + query);
  },

  chooseRoute: async (req, res, next) => {
    let schedules = req.dataProcessed || req.cookies.schedules;
    res.render("chooseRoute", { schedules });
  },

  showBus: async (req, res, next) => {
    let bus = await Bus.findOne({ _id: req.params.busId });
    res.render("bus/view", { bus });
  },

  selectSeats: async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.scheduleId);
    const abs = await AssignBusToSchedule.findOne({
      schedule: req.params.scheduleId,
    });

    const bus = await Bus.findOne({ _id: abs.bus });
    const assignSeat = await AssignSeat.findOne({ bus: abs.bus })
      .select("-__v -updatedAt")
      .sort({ _id: -1 });
    // console.log(assignSeat);
    var documents = assignSeat.seats;
    res.render("seats", { documents, bus, schedule });
  },

  booking: async (req, res, next) => {
    let { scheduleId, selectedSeats, price } = req.body;

    selectedSeats = selectedSeats.split(",");

    res.cookie("seatDetails", { scheduleId, seats: selectedSeats, price });

    res.redirect("/api/seats/booking");
  },

  // Enters bookers and passengers details
  bookingPage: async (req, res, next) => {
    let { scheduleId, seats, price } = req.cookies.seatDetails;
    scheduleId = mongoose.Types.ObjectId(scheduleId);

    const ac = await AssignCheckpoint.findOne({ schedule: scheduleId });

    const checkpoints = await Promise.all(
      ac.checkpoints.map(async (c) => await Checkpoint.findOne({ _id: c }))
    );
    return res.render("booking", { seats, checkpoints, price, scheduleId });
  },

  // after entering booking details, saves details to database
  confirmSeat: async (req, res, next) => {
    let passenger;
    let { seats, scheduleId, entryPoint, bookerName, phone, email } = req.body;
    let selectedSeats = seats.split(",");

    let noOfSeats = selectedSeats.length;

    entryPoint = mongoose.Types.ObjectId(entryPoint);

    const checkpoint = await Checkpoint.findOne({ _id: entryPoint });
    const schedule = await Schedule.findOne({ _id: scheduleId });
    const ab = await AssignBusToSchedule.findOne({ schedule: scheduleId });
    const bus = await Bus.findOne({ _id: ab.bus });

    const amount = schedule.price * noOfSeats;

    // Create booker
    const booker = await Booker.create({ name: bookerName, email, phone });

    // Create booking
    const booking = await Booking.create({
      bus: bus._id,
      booker: booker._id,
      schedule: schedule._id,
      checkpoint: entryPoint,
      noOfSeats,
      amount,
    });

    // Create Passenger
    for (let i = 0; i < selectedSeats.length; i++) {
      passenger = await Passenger.create({
        name: req.body["passName" + selectedSeats[i]],
        gender: req.body["gender" + selectedSeats[i]],
        seat: req.body["seat" + selectedSeats[i]],
        bookingId: booking._id,
      });
    }

    // Passengers of this booking
    const passengers = await Passenger.find({ bookingId: booking._id });
    console.log("ppp", passengers);
    // data to be sent to print tickets
    const data = {
      booker: booker.name,
      passengers,
      selectedSeats,
      booking: booking._id,
      bus: bus._id,
      busNo: bus.busNo,
      busName: bus.busName,
      image: bus.image,
      schedule,
      from: schedule.pickup,
      to: schedule.dropoff,
      price: schedule.price,
      checkpoint: checkpoint.checkpoint,
      noOfSeats,
      amount,
      date: booking.createdAt,
      status: booking.paymentStatus,
    };

    res.cookie("confirmTicket", data);
    res.redirect("/api/booking/confirmtickets");
    // return res.render('confirmTicket', { booking, data, booker });
  },

  confirmTicket: async (req, res, next) => {
    const data = req.cookies.confirmTicket;
    res.render("confirmTicket", { data });
  },

  verifySuccess: async (req, res, next) => {
    // fetch success data from url
    const queryObject = url.parse(req.url, true).query;
    console.log("this one", queryObject);

    const data = req.cookies.confirmTicket;

    res.render("tickets/verifyTicket", {
      seats: data.selectedSeats,
      response: queryObject,
    });
  },

  paySuccess: async (req, res, next) => {
    const data = req.cookies.confirmTicket;

    // update seats status
    const abs = await AssignBusToSchedule.findOne({
      schedule: data.schedule._id,
    });
    let asb = await AssignSeat.findOne({ bus: abs.bus });
    let seats = asb.seats;

    seats.forEach(async (s) => {
      if (data.selectedSeats.includes(s.number)) {
        s.status = false;
        await asb.save();
      }
    });

    // update booking status
    try {
      const booking = await Booking.findOne({ _id: data.booking });
      booking.paymentStatus = true;
      await booking.save();
      data.status = booking.paymentStatus;
    } catch (error) {
      console.log("error :>> ", error);
    }

    // save booking info in cookies
    res.cookie("booking", data);

    // fetch success data from url
    const queryObject = url.parse(req.url, true).query;
    console.log("this one", queryObject);

    // render print ticket page
    res.render("tickets/tickets", { data, response: queryObject });
    // res.json({ message: " Payment Successful " });
  },

  payFailure: async (req, res, next) => {
    console.log("payment failure");

    const data = req.cookies.booking;

    // update seat status to false
    let asb = await AssignSeat.findOne({ bus: data.bus });
    let seats = asb.seats;

    seats.forEach(async (s) => {
      if (data.selectedSeats.includes(s.number)) {
        s.status = false;
        await asb.save();
      }
    });

    // remove passenger details
    let passengers = await Passenger.find({ booking: data.booking });
    passengers.forEach(async (p) => {
      await p.remove();
    });

    // remove booker details
    await Booker.findOneAndDelete({ booking: data.booking });

    // remove booking
    await Booking.findOneAndDelete({ _id: data.booking });

    res.send({ message: " Payment Faild" });
  },

  testbooking: async (req, res, next) => {
    const data = req.cookies.confirmTicket;

    // update seats status
    const abs = await AssignBusToSchedule.findOne({
      schedule: data.schedule._id,
    });
    let asb = await AssignSeat.findOne({ bus: abs.bus });
    let seats = asb.seats;

    seats.forEach(async (s) => {
      if (data.selectedSeats.includes(s.number)) {
        s.status = false;
        await asb.save();
      }
    });

    // update booking status
    const booking = await Booking.findOne({ _id: data.booking });
    booking.paymentStatus = true;
    await booking.save();
    data.status = booking.paymentStatus;

    res.cookie("booking", data);
    // render print ticket page
    res.render("tickets/tickets", { data });
  },

  printTicketPage: (req, res, next) => {
    const data = req.cookies.booking;
    console.log(data);
    res.render("tickets", { data });
  },

  printRefTicket: async (req, res, next) => {
    const data = req.cookies.booking;

    const html = fs.readFileSync(
      path.join(__dirname, "../views/refTicket.html"),
      "utf-8"
    );

    const filename = `refTicket_${data.booking}_${
      Math.random() * 1000
    }_doc.pdf`;

    const document = {
      html: html,
      data: {
        data,
      },
      path: "./tickets/ref/" + filename,
    };

    const options = {
      formate: "A3",
      orientation: "portrait",
      border: "2mm",
      header: {
        height: "15mm",
        contents:
          '<h4 style=" color: red;font-size:20;font-weight:800;text-align:center;">Way To Way Travels</h4>',
      },
      footer: {
        height: "20mm",
        contents: {
          first: "Cover page",
          2: "Second page",
          default:
            '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          last: "Last Page",
        },
      },
    };

    pdf
      .create(document, options)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });

    const filepath = "http://localhost:3000/tickets/ref/" + filename;

    res.render("refTicket.ejs", {
      path: filepath,
      data,
    });
  },

  showTicket: (req, res, next) => {
    const ticket = req.cookies.printTicket;
    res.render("tickets/printTicket.ejs", {
      path: ticket.path,
      ticket,
    });
  },

  printTicket: async (req, res, next) => {
    var ticket = req.body;
    // const data = req.cookies.booking;
    // ticket = {...ticket, }
    const html = fs.readFileSync(
      path.join(__dirname, "../views/tickets/printTicket.html"),
      "utf-8"
    );
    // const html = fs.readFileSync(path.join(__dirname, '../views/template.html'), 'utf-8');

    const filename = `${ticket.pname}_${Math.random()}_doc.pdf`;

    const document = {
      html: html,
      data: {
        ticket,
      },
      path: "./tickets/" + filename,
    };

    const options = {
      formate: "A3",
      orientation: "portrait",
      border: "2mm",
      header: {
        height: "15mm",
        contents:
          '<h4 style=" color: red;font-size:20;font-weight:800;text-align:center;">Way To Way Travels</h4>',
      },
      footer: {
        height: "20mm",
        contents: {
          first: "Cover page",
          2: "Second page",
          default:
            '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          last: "Last Page",
        },
      },
    };

    pdf
      .create(document, options)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });

    const filepath = "http://localhost:3000/tickets/" + filename;

    const ticketData = { ...ticket, path: filepath };

    res.cookie("printTicket", ticketData);
    res.render("tickets/printTicket.ejs", {
      path: filepath,
      ticket,
    });
  },

  showReport: async (req, res, next) => {
    const bookings = await Booking.find()
      .select("-__v -updatedAt")
      .sort({ _id: -1 });
    var page = "index";
    var busIds = await Promise.all(
      bookings.map(async (b) => {
        const { _id } = await Bus.findOne({ _id: b.bus });
        return _id.toString();
      })
    );

    busIds = [...new Set(busIds)];

    var buses = await Promise.all(
      busIds.map(async (b) => {
        return await Bus.findOne({ _id: b });
      })
    );

    res.render("reports", { buses, page });
  },

  bookingReport: async (req, res, next) => {
    const { from1, from2, bus, page } = req.body;
    console.log(req.body);
  },
  // printTicket: (req, res, next) => {
  //     const ticket = req.body;

  //     const filePathName = path.resolve(__dirname, '../views/printTicket.ejs');

  //     // readfile
  //     fs.readFile(filePathName, 'utf8', function(err, content) {
  //         console.log('ppppp')

  //         if (err) {
  //             return res.status(400).send({ error: err });
  //         }

  //         var options = {
  //             "type": ".pdf",
  //             "height": "650px",
  //             "width": "850px",
  //             "renderDelay": 2000,
  //             "format": "Letter",
  //             "base": "file:///E:\\WORKOUTS\\mybusproject\\public"
  //         };
  //         res.render("printTicket.ejs", { ticket }, function(err, html) {
  //             pdf.create(html, options).toFile(`./tickets/${ticket.pname}-ticket-${Math.floor(Math.random() * 1000)}.pdf`, function(err, res) {
  //                 if (err) {
  //                     console.log(err);
  //                 } else { console.log(res); }
  //             });

  //             res.send(html);
  //         });
  //         // pdf.create(content, options).toFile(function(err, stream) {
  //         //     stream.pipe(fs.createWriteStream(`./tickets/${ticket.pname}-ticket-${Math.floor(Math.random() * 1000)}.pdf`));
  //         // });
  //     })
  // },
};

// function topdf(){

//     const filePathName = path.resolve(__dirname, '../views/printTicket.ejs');
//     // const html = fs.readFileSync(filePathName).toString();

//     // readfile
//     fs.readFile(filePathName, 'utf8', function(err, content) {
//         if (err) {
//             return res.status(400).send({ error: err });
//         }
//         console.log(content);
//         // update the html content with required fields
//         content = ejs.render(content, { ticket });
//         var width = 794;
//         var height = 1122;
//         var options = {
//             width: `${width}px`,
//             height: `${height}px`,
//             border: '0px',
//             viewportSize: {
//                 width,
//                 height
//             },
//         };
//         pdf.create(content, options).toStream(function(err, stream) {
//             stream.pipe(fs.createWriteStream(`./tickets/${ticket.pname}-ticket-${Math.floor(Math.random() * 1000)}.pdf`));
//         });
//     })

// }

export default homeController;
