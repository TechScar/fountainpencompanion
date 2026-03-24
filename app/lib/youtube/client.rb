class Youtube
  class Client
    APPLICATION_NAME = "Fountain Pen Companion"

    def self.credentials
      @credentials ||= YAML.load(ENV["GOOGLE_CREDENTIALS"])
    end

    def self.secrets
      @secrets ||= YAML.load(ENV["GOOGLE_CLIENT_SECRETS"])
    end
    SCOPE = Google::Apis::YoutubeV3::AUTH_YOUTUBE_READONLY

    class Credentials
      def initialize
        @credentials = Client.credentials
      end

      def load(user_id)
        @credentials[user_id]
      end

      def store(user_id, json)
        @credentials[user_id] = json
      end
    end

    def initialize
      self.service = Google::Apis::YoutubeV3::YouTubeService.new
      self.service.client_options.application_name = APPLICATION_NAME
      self.service.authorization = authorize
    end

    def method_missing(method, *args, **kwargs)
      self.service.send(method, *args, **kwargs)
    end

    private

    attr_accessor :service

    def authorize
      client_id = Google::Auth::ClientId.from_hash(Client.secrets)
      authorizer = Google::Auth::UserAuthorizer.new(client_id, SCOPE, Credentials.new)
      authorizer.get_credentials("default")
    end
  end
end
