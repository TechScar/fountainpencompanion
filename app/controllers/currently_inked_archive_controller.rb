# Manages the user's archived currently inked records (pens/ink pairings).
# Renders the shared currently inked views in archive mode, allowing users to view, edit, unarchive, or delete archived currently inked entries.
#
# Each record links a collected pen and a collected ink, with an inked_on date and optional comment.
# Only the current user's archived records are accessible.
class CurrentlyInkedArchiveController < ApplicationController
  before_action :authenticate_user!
  before_action :find_currently_inked, only: %i[edit update destroy unarchive]

  add_breadcrumb "Currently Inked", :currently_inked_index_path
  add_breadcrumb "Archive", :currently_inked_archive_index_path

  helper_method :archive?

  # Render the shared currently inked index view in archive mode
  def index
    render "currently_inked/index"
  end

  # Render form to edit an archived currently inked record
  def edit
    add_breadcrumb "Edit '#{@record.name}'", "#{currently_inked_archive_path(@record)}/edit"
    render "currently_inked/edit"
  end

  # Update an archived currently inked record
  def update
    if @record.update(currently_inked_params)
      flash[:notice] = "Successfully updated '#{@record.name}'"
      redirect_to currently_inked_archive_index_path
    else
      render "currently_inked/edit"
    end
  end

  # Unarchive a currently inked record
  def unarchive
    flash[:notice] = "Successfully unarchived '#{@record.name}'" if @record
    @record.unarchive!
    redirect_to currently_inked_archive_index_path
  end

  # Delete an archived currently inked record
  def destroy
    flash[:notice] = "Successfully deleted '#{@record.name}'" if @record
    @record.destroy
    redirect_to currently_inked_archive_index_path
  end

  private

  # Find a currently inked record for the current user by ID
  def find_currently_inked
    @record = current_user.currently_inkeds.find(params[:id])
  end

  def archive?
    true
  end

  # Whitelist permitted parameters for archived currently inked update
  def currently_inked_params
    params.require(:currently_inked).permit(
      :collected_ink_id,
      :collected_pen_id,
      :inked_on,
      :archived_on,
      :comment
    )
  end
end
