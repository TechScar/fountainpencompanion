class SerializableUser < JSONAPI::Serializable::Resource
  type "user"
  attribute :name
  attribute :preferences

  has_many :collected_inks do
    data { @object.public_inks.includes(:micro_cluster, { currently_inkeds: :usage_records }) }
  end
end
