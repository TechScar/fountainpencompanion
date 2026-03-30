Honeybadger.configure do |config|
  config.before_notify do |notice|
    if notice.error_class == "ArgumentError" && notice.error_message.match?(/invalid %-encoding/)
      notice.halt!
    end
  end
end
