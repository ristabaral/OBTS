import {
  AssignBus,
  AssignBusToSchedule,
  AssignSeat,
  Bus,
  Seat,
} from "../models";
import multer from "multer";
import path from "path";
import { CustomErrorHandler } from "../services";
import fs from "fs";
import { busSchema } from "../validators";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

const busController = {
  async index(req, res, next) {
    let documents;
    console.log("documents :>> ");

    // Pagination.mongoose-pagination
    try {
      documents = await Bus.find().select("-__v -updatedAt").sort({ _id: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
    // const buses = await AssignBus.find({ operator: req.user._id });
    // console.log(buses)
    // return res.render('bus/index', { documents });
  },

  async store(req, res, next) {
    // Multipart form data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      const filePath = req.file.path;

      // Validation
      console.log(req.body);
      const { error } = busSchema.validate(req.body);

      if (error) {
        // delete the uploaded file
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) return next(CustomErrorHandler.serverError(err.message));
        });
        return next(error);
      }

      const { busName, busNo, numOfSeats, type } = req.body;

      let document;

      try {
        document = await Bus.create({ busNo, busName, type, image: filePath });

        try {
          let buses = [];
          let operator = req.user._id;
          let bus = document._id;
          const assignBus = await AssignBus.findOne({ operator });
          if (!assignBus) {
            buses.push(document._id);
            await AssignBus.create({ buses, operator });
          } else {
            let busList = assignBus.buses;
            if (!busList.includes(bus)) {
              assignBus.buses.push(bus);
              await assignBus.save();
            }
          }
        } catch (err) {
          return next(err);
        }
      } catch (err) {
        return next(err);
      }

      try {
        const AllSeats = await Seat.find();

        if (AllSeats.length < 1) {
          seattts();
        }

        const mappedArr = AllSeats.map(async (s) => {
          let { number, status } = await Seat.findOne({ _id: s });
          return { number, status };
        });
        const seats = await Promise.all(mappedArr);

        const asb = await AssignSeat.findOne({ bus: document._id });
        if (!asb) {
          await AssignSeat.create({ bus: document._id, seats });
        }
      } catch (err) {
        return next(err);
      }

      return res.redirect("/api/dashboard/buses");
      // res.status(201).json(document);
    });
  },

  async update(req, res, next) {
    // Multipart form data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      let filePath;

      if (req.file) {
        filePath = req.file.path;
      }

      // Validation
      const { error } = busSchema.validate(req.body);

      if (error) {
        // delete the uploaded file
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) return next(CustomErrorHandler.serverError(err.message));
          });
        }
        return next(error);
      }

      const { busName, busNo, noOfSeats, type, scheduled } = req.body;

      var document;

      try {
        document = await Bus.findOneAndUpdate(
          { _id: req.params.id },
          {
            busName,
            scheduled,
            busNo,
            noOfSeats,
            type,
            ...(req.file && { image: filePath }),
          },
          {
            new: true,
          }
        );
        console.log(document);
      } catch (err) {
        return next(err);
      }
      return res.redirect("/api/dashboard/buses");
      // res.status(201).json(document);
    });
  },

  async show(req, res, next) {
    let document;
    try {
      document = await Bus.findOne({ _id: req.params.id }).select(
        "-__v -updatedAt"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(document);
  },

  async destroy(req, res, next) {
    const document = await Bus.findOneAndRemove({ _id: req.params.id });

    if (!document) return next(new Error("here Nothing to delete!"));
    // image delete
    const imagePath = document._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) return next(CustomErrorHandler.serverError());
    });

    // Assign bus to operator
    let assignBus;
    try {
      assignBus = await AssignBus.findOne({ operator: req.user._id }).select(
        "-__v -updatedAt"
      );

      if (!assignBus) return next(new Error(" there Nothing to delete!"));

      if (assignBus.buses.length > 0) {
        var index = assignBus.buses.indexOf(req.params.id);
        if (index > -1) {
          assignBus.buses.splice(index, 1);
        }
        await assignBus.save();
      } else {
        return next(new Error(" or here Nothing to delete!"));
      }
    } catch (err) {
      return next(err);
    }

    // Remove this bus from the schedule
    let abs;
    try {
      abs = await AssignBusToSchedule.findOne({ bus: req.params.id }).select(
        "-__v -updatedAt"
      );

      if (abs) await abs.remove();
      // abs.bus = null;
      // await abs.save();
    } catch (err) {
      return next(err);
    }
    // return res.json(document);
    return res.redirect("/api/dashboard/buses");
  },

  addbusPage(req, res, next) {
    res.render("bus/create");
  },

  async updatePage(req, res, next) {
    const bus = await Bus.findOne({ _id: req.params.id });
    res.render("bus/update", { bus });
  },
};

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
}

export default busController;
