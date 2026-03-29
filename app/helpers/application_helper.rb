module ApplicationHelper
  THEME_COOKIE_KEY = "fpc-theme".freeze
  THEME_MODE_COOKIE_KEY = "fpc-theme-mode".freeze
  THEME_MODES = %w[auto dark light].freeze

  def bootstrap_theme
    return theme_mode if %w[dark light].include?(theme_mode)

    theme = cookies[THEME_COOKIE_KEY]
    %w[dark light].include?(theme) ? theme : "light"
  end

  def theme_mode
    mode = cookies[THEME_MODE_COOKIE_KEY]
    THEME_MODES.include?(mode) ? mode : "auto"
  end

  def patron_tiny(user)
    title = "Supports this site with a monthly subscription through Patreon."
    image_tag("patreon.png", class: "fpc-patron-tiny", title: title) if user.patron?
  end

  def leaderboard_patron_tiny(data)
    title = "Supports this site with a monthly subscription through Patreon."
    image_tag("patreon.png", class: "fpc-patron-tiny", title: title) if data[:patron]
  end

  def show_fundraiser?
    # Only for signed in users, roughly every 8 weeks
    user_signed_in? && !current_user.patron? && (Date.current.cweek % 8).zero?
  end

  def admin?
    current_user&.admin?
  end

  def jsonify(object)
    JSON.pretty_generate(object).gsub('\r\n', " ").gsub('\n', "\n")
  end
end
