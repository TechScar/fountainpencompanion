# Manages the user's active (non-archived) collected inks.
# Renders the shared collected inks views for active inks, allowing users to view, create, edit, or archive inks.
class CollectedInksController < ApplicationController
  before_action :authenticate_user!
  before_action :find_collected_ink, only: %i[edit update archive]

  add_breadcrumb "My inks", :collected_inks_path

  helper_method :archive?

  # List all active inks for the current user
  # Supports HTML, JSON, and CSV formats
  # Can be filtered by macro_cluster_id
  def index
    inks =
      current_user
        .collected_inks
        .includes(
          :currently_inkeds,
          :usage_records,
          :tags,
          micro_cluster: :macro_cluster,
          newest_currently_inked: :last_usage
        )
        .order(:brand_name, :line_name, :ink_name)
    if params.dig(:filter, :macro_cluster_id)
      inks =
        inks.joins(:micro_cluster).where(
          micro_clusters: {
            macro_cluster_id: params.dig(:filter, :macro_cluster_id)
          }
        )
    end
    respond_to do |format|
      format.html
      format.json do
        render json: CollectedInkSerializer.new(inks, index_options).serializable_hash.to_json
      end
      format.csv { send_data inks.to_csv, type: "text/csv", filename: "collected_inks.csv" }
    end
  end

  # Render form to add a new ink
  def new
    add_breadcrumb "Add ink", "#{collected_inks_path}/new"

    @collected_ink = current_user.collected_inks.build
  end

  # Render import form for bulk ink uploads
  def import
  end

  # Add a new ink for the current user
  def create
    @collected_ink = current_user.collected_inks.build
    if SaveCollectedInk.new(@collected_ink, collected_ink_params).perform
      flash[:notice] = "Successfully added '#{@collected_ink.name}'"
      if params[:redo]
        @collected_ink = current_user.collected_inks.build
        render :new
      else
        redirect_to collected_inks_path
      end
    else
      render :new
    end
  end

  # Render form to edit an active ink
  def edit
    add_breadcrumb "Edit '#{@collected_ink.name}'", "#{collected_ink_path(@collected_ink)}/edit"
  end

  # Update an active ink
  def update
    if SaveCollectedInk.new(@collected_ink, collected_ink_params).perform
      flash[:notice] = "Successfully updated '#{@collected_ink.name}'"
      redirect_to collected_inks_path
    else
      render :edit
    end
  end

  # Archive an active ink
  def archive
    flash[:notice] = "Successfully archived '#{@collected_ink.name}'" if @collected_ink
    @collected_ink&.archive!
    redirect_to collected_inks_path
  end

  private

  # Find an ink for the current user by ID
  def find_collected_ink
    @collected_ink = current_user.collected_inks.find(params[:id])
  end

  # Shared helper used by views to distinguish active/archive mode
  # Returns false for active controller (true for archive controller)
  def archive?
    false
  end

  # Whitelist permitted parameters for ink create/update
  def collected_ink_params
    params.require(:collected_ink).permit(
      :brand_name,
      :line_name,
      :ink_name,
      :maker,
      :kind,
      :swabbed,
      :used,
      :comment,
      :private_comment,
      :color,
      :private,
      :tags_as_string
    )
  end

  # Configure JSON serialization options for index action
  def index_options
    options = { include: [:tags] }
    if params.dig(:fields, :collected_ink)
      options[:fields] = { collected_ink: params.dig(:fields, :collected_ink).split(/\s*,\s*/) }
    end
    options
  end
end
