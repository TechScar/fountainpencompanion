class GoogleSearch
  def initialize(query)
    self.query = query
  end

  def perform
    response = connection.post("search") { |req| req.body = { q: query } }
    body = response.body
    return body unless body.is_a?(Hash)

    {
      "items" =>
        (body["organic"] || []).map do |r|
          { "title" => r["title"], "link" => r["link"], "snippet" => r["snippet"] }
        end,
      "searchInformation" => {
        "totalResults" => body.dig("searchInformation", "totalResults").to_s
      }
    }
  end

  private

  attr_accessor :query

  def api_key
    ENV.fetch("SERPER_API_KEY")
  end

  def connection
    Faraday.new("https://google.serper.dev/") do |c|
      c.request :json
      c.response :json
      c.headers["X-API-KEY"] = api_key
    end
  end
end
