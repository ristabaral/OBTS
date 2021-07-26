import { AssignSeat, Bus, Seat } from "../models";
import { CustomErrorHandler } from "../services";
import { seatSchema } from "../validators";

const seatController = {
  async index(req, res, next) {
    let documents, bus;
    // Pagination.mongoose-pagination
    try {
      bus = await Bus.findOne({ _id: req.params.busId });
      const assignSeat = await AssignSeat.findOne({ bus: req.params.busId })
        .select("-__v -updatedAt")
        .sort({ _id: -1 });

      if (assignSeat) {
        if (assignSeat.seats.length > 0) {
          // const mappedArr = assignSeat.seats.map(async seat => await Seat.findOne({ _id: seat }));

          // documents = await Promise.all(mappedArr);
          documents = assignSeat.seats;
        } else {
          // return res.render('das/index', { operator, documents })
          return redirect("/api/dashboard/buses");

          // return next(CustomErrorHandler.serverError('Operator has no buses!'));
        }
      } else {
        // return res.render('bus/index', { operator, documents })
        return redirect("/api/dashboard/buses");
        // return next(CustomErrorHandler.serverError('Operator has no buses!'));
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.render("viewSeats", { documents, bus });
    // return res.json(documents);
  },

  async store(req, res, next) {
    // Validation
    // const { error } = seatSchema.validate(req.body);

    // if (error) {
    //     return next(error);
    // }

    // let { status, number } = req.body;

    // let document;

    // try {
    //     document = await Seat.create({ status, number });

    // } catch (err) {
    //     return next(err);
    // }

    // createRandomData();
    seattts();
    // createDoorAndDriver();
    // return res.redirect('/api/dashboard');
    res.status(201).json();
  },

  async update(req, res, next) {
    console.log(req.body);
    // Validation
    const { error } = seatSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    let { status, number } = req.body;

    let document;

    try {
      document = await Seat.findOneAndUpdate(
        { _id: req.params.id },
        { status, number },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }
    return res.redirect("/api/dashboard/buses");
    // res.status(201).json(document);
  },

  async show(req, res, next) {
    let document;
    try {
      document = await Seat.findOne({ _id: req.params.id }).select(
        "-__v -updatedAt"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(document);
  },

  async destroy(req, res, next) {
    const document = await Seat.findOneAndRemove({ _id: req.params.id });

    if (!document) return next(new Error("Nothing to delete!"));

    return res.redirect("/api/dashboard/buses");
    // return res.json(document);
  },

  async updateSeats(req, res, next) {
    let { selectedSeats, bus } = req.body;
    console.log(req.body);
    var bookedSeats = selectedSeats.split(",");
    const asb = await AssignSeat.findOne({ bus });

    asb.seats.forEach(async (s) => {
      if (bookedSeats.includes(s.number)) {
        s.status = false;
        await asb.save();
      }
    });
    return res.redirect(`/api/dashboard/buses/seats/${bus}`);
    // console.log(seats)

    // const bus = await Bus.findOne({})
  },
};

// async function createRandomData() {
//     const insert = (arr, index, ...items) => [...arr.slice(0, index), ...items, ...arr.slice(index), ]
//     for (var i = 1; i < 46; i++) {
//         var seatnum = "S" + i;
//         var ans;
//         if (seatnum.length < 3) {
//             var arr = seatnum.split('');
//             var result = insert(arr, 1, "0");
//             ans = result.join("")
//             await Seat.create({ number: ans });
//         } else {
//             await Seat.create({ number: seatnum });
//         }
//     }
// }

async function seattts() {
  var seats = [
    ["DOOR", "", "", "", "D"],
    ["S01", "S02", "", "S03", "S04"],
    ["S05", "S06", "", "S07", "S08"],
    ["S09", "S10", "", "S11", "S12"],
    ["S13", "S14", "", "S15", "S16"],
    ["S17", "S18", "", "S19", "S20"],
    ["S21", "S22", "", "S23", "S24"],
    ["S25", "S26", "", "S27", "S28"],
    ["S29", "S30", "", "S31", "S32"],
    ["S33", "S34", "", "S35", "S36"],
    ["S37", "S38", "", "S39", "S40"],
    ["S41", "S42", "S43", "S44", "S45"],
  ];

  var st = {};
  seats.forEach((r) => {
    r.forEach(async (s) => {
      st.number = s;
      if (s != "" && s != "DOOR" && s != "D") st.status = true;
      else st.status = false;
      console.log(st);
      try {
        await Seat.create(st);
      } catch (err) {
        console.log("err :>> ", err);
      }
    });
  });
  let getSeats = await Seat.find();
  console.log("getSeats :>> ", getSeats);
}

export default seatController;
