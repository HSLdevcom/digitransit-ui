TEST_NAME = "Front page - Nearest stops"

describe TEST_NAME, () ->
  it "Should not be discovered until user's location is set"
  it "Should be ordered by user's distance to stop location"
  it "Should show 10 stop cards per load"
  it "Should fetch 10 next stop cards when 'show more' is clicked"
  it "Should contain 5 next departures"
  it "Should show line numbers that do not fit to shown departures"
  it "Should show '~' character in front of time that is not realtime"
  it "Should show plain time without '~' character for realtime departure"
  it "Should show colored star when stop card is favourite"
  it "Should add and remove favourites by click of star icon"
  
  
