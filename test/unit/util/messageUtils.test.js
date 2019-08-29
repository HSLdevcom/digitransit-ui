import { expect } from 'chai';
import { describe, it } from 'mocha';
import { mockContext } from '../helpers/mock-context';
import triggerMessage from '../../../app/util/messageUtils';
import MessageStore from '../../../app/store/MessageStore';

describe('triggerMessage', () => {
  it("should call the update message action if position is found from the message's GeoJSON", async () => {
    const store = new MessageStore();

    const lon = 24.933973;
    const lat = 60.199017;

    const config = {
      staticMessages: [
        {
          id: '1',
          content: {
            en: [
              {
                type: 'text',
                content: 'bar',
              },
            ],
          },
          shouldTrigger: false,
          priority: -1,
        },
      ],
    };

    await store.addConfigMessages(config);

    const msgs = [
      {
        dataURI: '',
        geoJson:
          'data:application/json;base64,ewogICJ0eXBlIjogIkZlYXR1cmVDb2xsZWN0aW9uIiwKICAiZmVhdHVyZXMiOiBbCiAgICB7CiAgICAgICJ0eXBlIjogIkZlYXR1cmUiLAogICAgICAiZ2VvbWV0cnkiOiB7CiAgICAgICAgInR5cGUiOiAiUG9seWdvbiIsCiAgICAgICAgImNvb3JkaW5hdGVzIjogWwogICAgICAgICAgWwogICAgICAgICAgICBbCiAgICAgICAgICAgICAgMjQuOTMxNDAzNjQ4NTg2NTI0LAogICAgICAgICAgICAgIDYwLjIwMDc2NjQ1MDk1NDE4CiAgICAgICAgICAgIF0sCiAgICAgICAgICAgIFsKICAgICAgICAgICAgICAyNC45Mjg1MDY4NjI4NTA0NCwKICAgICAgICAgICAgICA2MC4xOTk4NjAwMjc3NDA5NTQKICAgICAgICAgICAgXSwKICAgICAgICAgICAgWwogICAgICAgICAgICAgIDI0LjkyOTQ1MTAwMDQyMzY4MywKICAgICAgICAgICAgICA2MC4xOTcwOTc5NDg1MDMyCiAgICAgICAgICAgIF0sCiAgICAgICAgICAgIFsKICAgICAgICAgICAgICAyNC45MzQ1NzkzODQwNjAxNTcsCiAgICAgICAgICAgICAgNjAuMTk1MTc4MjE5ODIxNzEKICAgICAgICAgICAgXSwKICAgICAgICAgICAgWwogICAgICAgICAgICAgIDI0Ljk0MzE2MjQ1MjkwNzgxNCwKICAgICAgICAgICAgICA2MC4xOTYyNTU0MTQ3NDIzMgogICAgICAgICAgICBdLAogICAgICAgICAgICBbCiAgICAgICAgICAgICAgMjQuOTQ0NDA2OTk3ODkwNzI0LAogICAgICAgICAgICAgIDYwLjIwMDIzMzI2Mzg2MTEzCiAgICAgICAgICAgIF0sCiAgICAgICAgICAgIFsKICAgICAgICAgICAgICAyNC45Mzg2OTkyNTcxMDcwMzIsCiAgICAgICAgICAgICAgNjAuMjAxNTg3NTQyMTMyNzMKICAgICAgICAgICAgXSwKICAgICAgICAgICAgWwogICAgICAgICAgICAgIDI0LjkzMTQwMzY0ODU4NjUyNCwKICAgICAgICAgICAgICA2MC4yMDA3NjY0NTA5NTQxOAogICAgICAgICAgICBdCiAgICAgICAgICBdCiAgICAgICAgXQogICAgICB9LAogICAgICAicHJvcGVydGllcyI6IHt9CiAgICB9CiAgXQp9',
        content: {
          fi: [
            {
              content: 'Geojson testi: olet Pasilassa',
              type: 'heading',
            },
          ],
          en: [
            {
              content: 'Geojson test:  you are in Pasila',
              type: 'heading',
            },
          ],
          sv: [
            {
              content: 'Geojson test: Pasila',
              type: 'heading',
            },
          ],
        },
        backgroundColor: '#ffffff',
        textColor: '#449599',
        type: 'info',
        id: '16082019_120612_45',
        persistence: 'repeat',
        priority: '2',
        shouldTrigger: true,
      },
    ];

    await triggerMessage(lon, lat, mockContext, msgs);
    expect(store.getMessages()[0].shouldTrigger).to.equal(true);
  });
});
