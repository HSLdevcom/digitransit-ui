'use strict';

// FeedMessage ========================================

exports.FeedMessage = {read: readFeedMessage};

function readFeedMessage(pbf, end) {
    return pbf.readFields(readFeedMessageField, {"entity": []}, end);
}

function readFeedMessageField(tag, feedmessage, pbf) {
    if (tag === 1) feedmessage.header = readFeedHeader(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) feedmessage.entity.push(readFeedEntity(pbf, pbf.readVarint() + pbf.pos));
}

// FeedHeader ========================================

exports.FeedHeader = {read: readFeedHeader};

FeedHeader.Incrementality = {
    "FULL_DATASET": 0,
    "DIFFERENTIAL": 1
};

function readFeedHeader(pbf, end) {
    var feedheader = pbf.readFields(readFeedHeaderField, {}, end);
    if (feedheader.incrementality === undefined) feedheader.incrementality = "FULL_DATASET";
    return feedheader;
}

function readFeedHeaderField(tag, feedheader, pbf) {
    if (tag === 1) feedheader.gtfs_realtime_version = pbf.readString();
    else if (tag === 2) feedheader.incrementality = pbf.readVarint();
    else if (tag === 3) feedheader.timestamp = pbf.readVarint();
}

// FeedEntity ========================================

exports.FeedEntity = {read: readFeedEntity};

function readFeedEntity(pbf, end) {
    return pbf.readFields(readFeedEntityField, {}, end);
}

function readFeedEntityField(tag, feedentity, pbf) {
    if (tag === 1) feedentity.id = pbf.readString();
    else if (tag === 2) feedentity.is_deleted = pbf.readBoolean();
    else if (tag === 3) feedentity.trip_update = readTripUpdate(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4) feedentity.vehicle = readVehiclePosition(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) feedentity.alert = readAlert(pbf, pbf.readVarint() + pbf.pos);
}

// TripUpdate ========================================

var TripUpdate = exports.TripUpdate = {read: readTripUpdate};

function readTripUpdate(pbf, end) {
    return pbf.readFields(readTripUpdateField, {"stop_time_update": []}, end);
}

function readTripUpdateField(tag, tripupdate, pbf) {
    if (tag === 1) tripupdate.trip = readTripDescriptor(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3) tripupdate.vehicle = readVehicleDescriptor(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) tripupdate.stop_time_update.push(readStopTimeUpdate(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 4) tripupdate.timestamp = pbf.readVarint();
    else if (tag === 5) tripupdate.delay = pbf.readVarint();
}

// StopTimeEvent ========================================

TripUpdate.StopTimeEvent = {read: readStopTimeEvent};

function readStopTimeEvent(pbf, end) {
    return pbf.readFields(readStopTimeEventField, {}, end);
}

function readStopTimeEventField(tag, stoptimeevent, pbf) {
    if (tag === 1) stoptimeevent.delay = pbf.readVarint();
    else if (tag === 2) stoptimeevent.time = pbf.readVarint();
    else if (tag === 3) stoptimeevent.uncertainty = pbf.readVarint();
}

// StopTimeUpdate ========================================

TripUpdate.StopTimeUpdate = {read: readStopTimeUpdate};

StopTimeUpdate.ScheduleRelationship = {
    "SCHEDULED": 0,
    "SKIPPED": 1,
    "NO_DATA": 2
};

function readStopTimeUpdate(pbf, end) {
    var stoptimeupdate = pbf.readFields(readStopTimeUpdateField, {}, end);
    if (stoptimeupdate.schedule_relationship === undefined) stoptimeupdate.schedule_relationship = "SCHEDULED";
    return stoptimeupdate;
}

function readStopTimeUpdateField(tag, stoptimeupdate, pbf) {
    if (tag === 1) stoptimeupdate.stop_sequence = pbf.readVarint();
    else if (tag === 4) stoptimeupdate.stop_id = pbf.readString();
    else if (tag === 2) stoptimeupdate.arrival = readStopTimeEvent(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3) stoptimeupdate.departure = readStopTimeEvent(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) stoptimeupdate.schedule_relationship = pbf.readVarint();
}

// VehiclePosition ========================================

exports.VehiclePosition = {read: readVehiclePosition};

VehiclePosition.VehicleStopStatus = {
    "INCOMING_AT": 0,
    "STOPPED_AT": 1,
    "IN_TRANSIT_TO": 2
};

VehiclePosition.CongestionLevel = {
    "UNKNOWN_CONGESTION_LEVEL": 0,
    "RUNNING_SMOOTHLY": 1,
    "STOP_AND_GO": 2,
    "CONGESTION": 3,
    "SEVERE_CONGESTION": 4
};

VehiclePosition.OccupancyStatus = {
    "EMPTY": 0,
    "MANY_SEATS_AVAILABLE": 1,
    "FEW_SEATS_AVAILABLE": 2,
    "STANDING_ROOM_ONLY": 3,
    "CRUSHED_STANDING_ROOM_ONLY": 4,
    "FULL": 5,
    "NOT_ACCEPTING_PASSENGERS": 6
};

function readVehiclePosition(pbf, end) {
    var vehicleposition = pbf.readFields(readVehiclePositionField, {}, end);
    if (vehicleposition.current_status === undefined) vehicleposition.current_status = "IN_TRANSIT_TO";
    return vehicleposition;
}

function readVehiclePositionField(tag, vehicleposition, pbf) {
    if (tag === 1) vehicleposition.trip = readTripDescriptor(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 8) vehicleposition.vehicle = readVehicleDescriptor(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) vehicleposition.position = readPosition(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3) vehicleposition.current_stop_sequence = pbf.readVarint();
    else if (tag === 7) vehicleposition.stop_id = pbf.readString();
    else if (tag === 4) vehicleposition.current_status = pbf.readVarint();
    else if (tag === 5) vehicleposition.timestamp = pbf.readVarint();
    else if (tag === 6) vehicleposition.congestion_level = pbf.readVarint();
    else if (tag === 9) vehicleposition.occupancy_status = pbf.readVarint();
}

// Alert ========================================

exports.Alert = {read: readAlert};

Alert.Cause = {
    "UNKNOWN_CAUSE": 1,
    "OTHER_CAUSE": 2,
    "TECHNICAL_PROBLEM": 3,
    "STRIKE": 4,
    "DEMONSTRATION": 5,
    "ACCIDENT": 6,
    "HOLIDAY": 7,
    "WEATHER": 8,
    "MAINTENANCE": 9,
    "CONSTRUCTION": 10,
    "POLICE_ACTIVITY": 11,
    "MEDICAL_EMERGENCY": 12
};

Alert.Effect = {
    "NO_SERVICE": 1,
    "REDUCED_SERVICE": 2,
    "SIGNIFICANT_DELAYS": 3,
    "DETOUR": 4,
    "ADDITIONAL_SERVICE": 5,
    "MODIFIED_SERVICE": 6,
    "OTHER_EFFECT": 7,
    "UNKNOWN_EFFECT": 8,
    "STOP_MOVED": 9
};

function readAlert(pbf, end) {
    var alert = pbf.readFields(readAlertField, {"active_period": [], "informed_entity": []}, end);
    if (alert.cause === undefined) alert.cause = "UNKNOWN_CAUSE";
    if (alert.effect === undefined) alert.effect = "UNKNOWN_EFFECT";
    return alert;
}

function readAlertField(tag, alert, pbf) {
    if (tag === 1) alert.active_period.push(readTimeRange(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5) alert.informed_entity.push(readEntitySelector(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) alert.cause = pbf.readVarint();
    else if (tag === 7) alert.effect = pbf.readVarint();
    else if (tag === 8) alert.url = readTranslatedString(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 10) alert.header_text = readTranslatedString(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 11) alert.description_text = readTranslatedString(pbf, pbf.readVarint() + pbf.pos);
}

// TimeRange ========================================

exports.TimeRange = {read: readTimeRange};

function readTimeRange(pbf, end) {
    return pbf.readFields(readTimeRangeField, {}, end);
}

function readTimeRangeField(tag, timerange, pbf) {
    if (tag === 1) timerange.start = pbf.readVarint();
    else if (tag === 2) timerange.end = pbf.readVarint();
}

// Position ========================================

exports.Position = {read: readPosition};

function readPosition(pbf, end) {
    return pbf.readFields(readPositionField, {}, end);
}

function readPositionField(tag, position, pbf) {
    if (tag === 1) position.latitude = pbf.readFloat();
    else if (tag === 2) position.longitude = pbf.readFloat();
    else if (tag === 3) position.bearing = pbf.readFloat();
    else if (tag === 4) position.odometer = pbf.readDouble();
    else if (tag === 5) position.speed = pbf.readFloat();
}

// TripDescriptor ========================================

exports.TripDescriptor = {read: readTripDescriptor};

TripDescriptor.ScheduleRelationship = {
    "SCHEDULED": 0,
    "ADDED": 1,
    "UNSCHEDULED": 2,
    "CANCELED": 3
};

function readTripDescriptor(pbf, end) {
    return pbf.readFields(readTripDescriptorField, {}, end);
}

function readTripDescriptorField(tag, tripdescriptor, pbf) {
    if (tag === 1) tripdescriptor.trip_id = pbf.readString();
    else if (tag === 5) tripdescriptor.route_id = pbf.readString();
    else if (tag === 6) tripdescriptor.direction_id = pbf.readVarint();
    else if (tag === 2) tripdescriptor.start_time = pbf.readString();
    else if (tag === 3) tripdescriptor.start_date = pbf.readString();
    else if (tag === 4) tripdescriptor.schedule_relationship = pbf.readVarint();
}

// VehicleDescriptor ========================================

exports.VehicleDescriptor = {read: readVehicleDescriptor};

function readVehicleDescriptor(pbf, end) {
    return pbf.readFields(readVehicleDescriptorField, {}, end);
}

function readVehicleDescriptorField(tag, vehicledescriptor, pbf) {
    if (tag === 1) vehicledescriptor.id = pbf.readString();
    else if (tag === 2) vehicledescriptor.label = pbf.readString();
    else if (tag === 3) vehicledescriptor.license_plate = pbf.readString();
}

// EntitySelector ========================================

exports.EntitySelector = {read: readEntitySelector};

function readEntitySelector(pbf, end) {
    return pbf.readFields(readEntitySelectorField, {}, end);
}

function readEntitySelectorField(tag, entityselector, pbf) {
    if (tag === 1) entityselector.agency_id = pbf.readString();
    else if (tag === 2) entityselector.route_id = pbf.readString();
    else if (tag === 3) entityselector.route_type = pbf.readVarint();
    else if (tag === 4) entityselector.trip = readTripDescriptor(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) entityselector.stop_id = pbf.readString();
}

// TranslatedString ========================================

var TranslatedString = exports.TranslatedString = {read: readTranslatedString};

function readTranslatedString(pbf, end) {
    return pbf.readFields(readTranslatedStringField, {"translation": []}, end);
}

function readTranslatedStringField(tag, translatedstring, pbf) {
    if (tag === 1) translatedstring.translation.push(readTranslation(pbf, pbf.readVarint() + pbf.pos));
}

// Translation ========================================

TranslatedString.Translation = {read: readTranslation};

function readTranslation(pbf, end) {
    return pbf.readFields(readTranslationField, {}, end);
}

function readTranslationField(tag, translation, pbf) {
    if (tag === 1) translation.text = pbf.readString();
    else if (tag === 2) translation.language = pbf.readString();
}
