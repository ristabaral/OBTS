import { AssignBusToSchedule, Bus, Schedule } from "../models";
var mongoose = require("mongoose");
import { CustomErrorHandler } from "../services";

const assignBusToScheduleController = {
  async index(req, res, next) {
    let document, schedule;
    // Pagination.mongoose-pagination
    try {
      const assignBusToSchedule = await AssignBusToSchedule.findOne({
        schedule: req.params.scheduleId,
      }).select("-__v -updatedAt");
      if (assignBusToSchedule) {
        if (assignBusToSchedule.bus) {
          document = await Bus.findById(assignBusToSchedule.bus);
          schedule = await Schedule.findById(req.params.scheduleId);
        } else {
          return next(
            CustomErrorHandler.notFound("Schedule has not set any bus!")
          );
        }
      } else {
        return next(
          CustomErrorHandler.notFound(
            "No bus has been assigned to this schedule!"
          )
        );
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json({ schedule, bus: document });
  },

  async store(req, res, next) {
    let { bus } = req.body;
    let { scheduleId } = req.params.scheduleId;
    bus = mongoose.Types.ObjectId(bus);
    scheduleId = mongoose.Types.ObjectId(scheduleId);

    let document;

    try {
      let assignbustoschedule = await AssignBusToSchedule.findOne({
        schedule: scheduleId,
      });
      if (!assignbustoschedule) {
        document = await AssignBusToSchedule.create({
          bus,
          schedule: scheduleId,
        });
        busData = await Bus.findById(bus);
        busData.scheduled = true;
        await busData.save();
      } else {
        if (assignbustoschedule.bus) {
          return next(
            CustomErrorHandler.alreadyExist(
              "This schedule already has a bus assigned!"
            )
          );
        } else {
          assignbustoschedule.bus = bus;
          await assignbustoschedule.save();
          busData = await Bus.findById(bus);
          busData.scheduled = true;
          await busData.save();
        }
        return next(
          CustomErrorHandler.alreadyExist(
            "This schedule already has a bus assigned!"
          )
        );
      }
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },

  async destroy(req, res, next) {
    let { scheduleId, busId } = req.params;
    bus = mongoose.Types.ObjectId(bus);
    scheduleId = mongoose.Types.ObjectId(scheduleId);
    let document;

    try {
      document = await AssignBusToSchedule.findOne({
        schedule: scheduleId,
      }).select("-__v -updatedAt");

      if (!document) {
        return next(CustomErrorHandler.notFound("Nothing to delete!"));
      } else {
        if (!document.bus) {
          return next(CustomErrorHandler.notFound("Nothing to delete!"));
        } else {
          document.bus = null;
          await document.save();
          busData = await Bus.findById(busId);
          busData.scheduled = false;
          await busData.save();
        }
      }
    } catch (err) {
      return next(err);
    }
    return res.json(document);
  },
};

export default assignBusToScheduleController;
