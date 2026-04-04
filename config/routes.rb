require "sidekiq/web"
require "sidekiq-scheduler/web"
require "sidekiq/throttled/web"

Rails.application.routes.draw do
  # API documentation and development-only tooling
  namespace "apipie", path: Apipie.configuration.doc_base_url do
    get "apipie_checksum", to: "apipies#apipie_checksum", format: "json"
    constraints version: %r{[^/]+}, resource: %r{[^/]+}, method: %r{[^/]+} do
      get "(:version)/(:resource)/(:method)", to: "apipies#index", as: :apipie
    end
  end
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

  # Authentication and session management
  devise_for :users,
             controllers: {
               registrations: "users/registrations",
               sessions: "custom_sessions"
             }

  # Public pages and dashboard widgets
  resource :dashboard, only: [:show] do
    resources :widgets, only: [:show]
  end
  resources :pages, only: [:show]
  resources :blog, only: %i[index show] do
    collection { get "feed", defaults: { format: "rss" } }
  end

  # User collection management (inks, pens, currently inked, usage)
  resources :reading_statuses, only: [:update]

  # Collected inks management
  resources :collected_inks, only: %i[index new create edit update] do
    collection { get "import" }
    member { post "archive" }
  end
  resources :collected_inks_archive,
            path: "collected_inks/archive",
            only: %i[index edit update destroy] do
    member { post "unarchive" }
  end
  namespace :collected_inks do
    resources :add, only: [:create]
  end

  # Collected pens management
  resources :collected_pens, only: %i[index new create edit update] do
    collection { get "import" }
    member { post "archive" }
  end
  resources :collected_pens_archive,
            path: "collected_pens/archive",
            only: %i[index edit update destroy] do
    member { post "unarchive" }
  end

  # Currently inked management, including usage record
  resources :currently_inked, only: %i[index new create edit update] do
    member do
      post "refill"
      post "archive"
    end
    resource :usage_record, only: [:create]
  end
  resources :currently_inked_archive,
            path: "currently_inked/archive",
            only: %i[index edit update destroy] do
    member { post "unarchive" }
  end
  resources :usage_records, only: %i[index destroy]

  # Ink and pen catalog browsing/editing
  resources :brands, only: %i[index edit update show] do
    resource :history, only: [:show]
    resources :inks, only: %i[show edit update] do
      member do
        get "edit_name"
        get "edit_colors"
      end
      resources :ink_review_submissions, only: [:create]
    end
  end

  resources :pen_brands, only: %i[index show] do
    resources :pen_models, only: %i[show] do
      resources :pen_variants, only: %i[show]
    end
  end
  resources :pen_models, only: %i[index show]
  resources :pen_variants, only: %i[show]

  resources :inks, only: %i[index show] do
    resource :history, only: [:show]
  end
  namespace :pens do
    resources :brands, only: [:index]
    resources :models, only: [:index]
    resources :nibs, only: [:index]
  end
  resource :account, only: %i[show edit update]
  resource :account_deletion, only: %i[create show destroy]
  resources :authentication_tokens, only: %i[index create destroy]

  # Public user profiles and contribution queues
  resources :users, only: %i[index show]

  resources :reviews, only: [] do
    collection do
      get "missing"
      get "my_missing"
    end
  end

  resources :descriptions, only: [] do
    collection do
      get "missing"
      get "my_missing"
    end
  end

  # Public JSON API endpoints
  namespace :api do
    namespace :v1 do
      resources :brands, only: %i[index show]
      resources :inks, only: [:index]
      resources :collected_inks, only: %i[index show create update destroy]
      resources :collected_pens, only: [:index]
      resources :currently_inked, only: [:index]
    end
  end

  # Administrative interface and moderation tools
  namespace :admins do
    resource :dashboard, only: [:show]
    resources :agent_logs, only: [:index]
    namespace :agents do
      resources :ink_clusterer, only: %i[index destroy update]
    end
    resources :stats, only: [:show]
    resources :users, only: %i[index show update destroy] do
      collection { get "to_review" }
      member do
        post "become"
        post "ink_import"
        post "pen_import"
        post "currently_inked_import"
        put "approve"
      end
    end
    resources :graphs, only: [:show]
    resources :brand_clusters, only: %i[index new create update]
    resources :macro_clusters, only: %i[index create update destroy show]
    resources :micro_clusters, only: %i[index update] do
      collection { get "ignored" }
      member { delete "unassign" }
    end

    namespace :pens do
      resources :micro_clusters, only: %i[index update] do
        collection { get "ignored" }
        member { delete "unassign" }
      end
      resources :model_variants, only: %i[index create show destroy]
      resources :models, only: %i[index create show destroy]
      resources :model_micro_clusters, only: %i[index update] do
        collection { get "ignored" }
        member { delete "unassign" }
      end
      resources :brand_clusters, only: %i[index new create update]
    end

    resources :blog_posts do
      member { put "publish" }
    end
    resources :reviews, only: %i[index update destroy] do
    end
    namespace :reviews do
      resources :missing, only: %i[index show] do
        member { post "add" }
      end
    end
    namespace :descriptions do
      resources :brands, only: [:index]
      resources :inks, only: [:index]
    end
  end

  # Admin-only mounted dashboards
  authenticate :user, ->(user) { user.admin? } do
    mount Sidekiq::Web => "/admins/sidekiq"
    mount PgHero::Engine, at: "/admins/pghero"
  end

  # Site homepage
  root "pages#show", id: "home"
end
