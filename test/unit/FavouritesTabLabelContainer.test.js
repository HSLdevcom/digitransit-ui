import { alertSeverityLevelMapper } from '../../app/component/FavouritesTabLabelContainer';
import { AlertSeverityLevelType } from '../../app/constants';

describe('<FavouritesTabLabelContainer />', () => {
  describe('alertSeverityLevelMapper', () => {
    it('should not fail if some routes are missing', () => {
      const currentTime = 1000;
      const props = {
        currentTime,
        routes: [
          {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                effectiveEndDate: currentTime + 1,
                effectiveStartDate: currentTime,
              },
            ],
          },
          undefined,
        ],
      };
      const result = alertSeverityLevelMapper({ ...props });
      expect(result.alertSeverityLevel).to.equal(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should not fail if some route alerts are missing', () => {
      const currentTime = 1000;
      const props = {
        currentTime,
        routes: [
          {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                effectiveEndDate: currentTime + 1,
                effectiveStartDate: currentTime,
              },
            ],
          },
          {
            alerts: null,
          },
        ],
      };
      const result = alertSeverityLevelMapper({ ...props });
      expect(result.alertSeverityLevel).to.equal(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should map the highest active alert severity level', () => {
      const currentTime = 1000;
      const props = {
        currentTime,
        routes: [
          {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                effectiveEndDate: currentTime + 1,
                effectiveStartDate: currentTime,
              },
            ],
          },
          {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
                effectiveEndDate: currentTime + 1,
                effectiveStartDate: currentTime,
              },
            ],
          },
        ],
      };
      const result = alertSeverityLevelMapper({ ...props });
      expect(result.alertSeverityLevel).to.equal(
        AlertSeverityLevelType.Warning,
      );
    });
  });
});
