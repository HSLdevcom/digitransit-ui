FROM node:10.23

EXPOSE 8080

# ENV \
#   # Where the app is built and run inside the docker fs \
#   WORK=/opt/digitransit-ui \
#   # Used indirectly for saving npm logs etc. \
#   HOME=/opt/digitransit-ui \
#   # App specific settings to override when the image is run \
#   SENTRY_DSN='' \
#   SENTRY_SECRET_DSN='' \
#   PORT=8080 \
#   API_URL='' \
#   MAP_URL='' \
#   OTP_URL='' \
#   GEOCODING_BASE_URL='' \
#   GTFS_URL=https://www.openvvs.de/dataset/e66f03e4-79f2-41d0-90f1-166ca609e491/resource/bfbb59c7-767c-4bca-bbb2-d8d32a3e0378/download/google_transit.zip \
#   OSM_URL=https://download.geofabrik.de/europe/germany/brandenburg-latest.osm.pbf \
#   APP_PATH='' \
#   CONFIG=bb_angermuende \
#   NODE_ENV='' \
#   # setting a non-empty default value for NODE_OPTS
#   # if you don't do this then yarn/node seem to think that you want to
#   # execute a file called "" (empty string) and doesn't start the server
#   # https://github.com/HSLdevcom/digitransit-ui/issues/4155
#   #
#   # the --title option just sets the harmless property process.title
#   # https://nodejs.org/api/cli.html#cli_title_title
#   NODE_OPTS='--title=digitransit-ui' \
#   RELAY_FETCH_TIMEOUT='' \
#   ASSET_URL='' \
#   STATIC_MESSAGE_URL=''

ENV WORK=/opt/digitransit-ui
ENV HOME=/opt/digitransit-ui
ENV NODE_OPTS=--title=digitransit-ui

# ENV GTFS_URL=https://www.vbb.de/fileadmin/user_upload/VBB/Dokumente/API-Datensaetze/GTFS.zip
# ENV OSM_URL=https://download.geofabrik.de/europe/germany/brandenburg-latest.osm.pbf
ENV API_URL=https://api.angermuende.bbnavi.de

WORKDIR ${WORK}
COPY . ${WORK}


RUN rm yarn.lock
RUN yarn install
RUN yarn setup
RUN yarn build

# Set bb_angermuende AFTER yarn build!
ENV CONFIG=bb_angermuende

# RUN rm -rf static docs test /tmp/*
# RUN yarn cache clean --all

CMD yarn run start
# CMD yarn run dev
