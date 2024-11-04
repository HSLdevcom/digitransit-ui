import BikeRentalStations from './BikeRentalStations';
import { drawCitybikeIcon } from '../../../util/mapIconUtils';

class RentalVehicles extends BikeRentalStations {
  getLayerBaseUrl = () => {
    return this.config.URL.RENTAL_VEHICLE_MAP;
  };

  getLayerName = () => {
    return 'rentalVehicles';
  };

  drawLargeIcon = ({ geom }, iconName, isHilighted, bgColor, fgColor) => {
    drawCitybikeIcon(
      this.tile,
      geom,
      true, // operative TODO: operativeif we had energy level we could disable them, but for now rely on every vehicle being operational
      1,
      iconName,
      false, // showAvailability don't show number of available vehicles, it's already one
      isHilighted,
      bgColor,
      fgColor,
    );
  };
}

export default RentalVehicles;
