import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

function EditCrewmate({ session }) {
  const { id } = useParams(); // Get the crewmate ID from the URL
  const [crewmateName, setCrewmateName] = useState('');
  const [crewmateMembers, setCrewmateMembers] = useState(''); // For comma-separated members
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch crewmate data to pre-fill the form
  useEffect(() => {
    const fetchCrewmate = async () => {
      setLoading(true);
      try {
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows found
            console.warn('Crewmate not found or not accessible for editing:', id);
            alert('Crewmate not found or you do not have permission to edit it.');
            navigate('/'); // Redirect to list if not found
          } else {
            throw error;
          }
        } else {
          setCrewmateName(data.name);
          setCrewmateMembers(data.members ? data.members.join(', ') : '');
        }
      } catch (error) {
        console.error('Error fetching crewmate for editing:', error.message);
        alert('Error fetching crewmate for editing: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCrewmate();
    }
  }, [id, session, navigate]);

  // Handle form submission for updating crewmate
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!crewmateName.trim()) {
      alert('Crewmate name cannot be empty.');
      return;
    }
    setSubmitting(true);

    try {
      const updatedMembersArray = crewmateMembers
        .split(',')
        .map(m => m.trim())
        .filter(m => m !== '');

      const { error } = await supabase
        .from('teams')
        .update({ name: crewmateName.trim(), members: updatedMembersArray })
        .eq('id', id); // Update the specific crewmate by ID

      if (error) {
        throw error;
      }

      alert('Crewmate updated successfully!');
      navigate(`/crewmate/${id}`); // Navigate back to the detail page
    } catch (error) {
      console.error('Error updating crewmate:', error.message);
      alert('Error updating crewmate: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting the crewmate from this page
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this crewmate permanently?')) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      alert('Crewmate deleted successfully!');
      navigate('/'); // Navigate back to the list page after deletion
    } catch (error) {
      console.error('Error deleting crewmate:', error.message);
      alert('Error deleting crewmate: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading crewmate data for editing...</div>;
  }

  if (!session?.user?.id) {
    return <div className="info-message">Please log in to edit crewmates.</div>;
  }

  return (
    <div className="edit-crewmate-container">
      <h2>Edit Crewmate: {crewmateName}</h2>
      <form onSubmit={handleSubmit} className="crewmate-form">
        <label htmlFor="editCrewmateName">Crewmate Name:</label>
        <input
          id="editCrewmateName"
          type="text"
          value={crewmateName}
          onChange={(e) => setCrewmateName(e.target.value)}
          required
        />

        <label htmlFor="editCrewmateMembers">Crewmate Members (comma-separated):</label>
        <input
          id="editCrewmateMembers"
          type="text"
          placeholder="e.g., Pilot, Navigator, Engineer"
          value={crewmateMembers}
          onChange={(e) => setCrewmateMembers(e.target.value)}
        />

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="primary-button">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleDelete} disabled={submitting} className="delete-button">
            {submitting ? 'Deleting...' : 'Delete Crewmate'}
          </button>
          <button type="button" onClick={() => navigate(`/crewmate/${id}`)} disabled={submitting} className="secondary-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCrewmate;

/*
  Explanation:
  - This component provides a dedicated form to update an existing crewmate.
  - It uses `useParams` to get the `id` of the crewmate to edit.
  - `useEffect` fetches the crewmate's current data to pre-fill the form.
  - `handleSubmit` updates the crewmate's data in Supabase.
  - `handleDelete` allows deleting the crewmate directly from this edit page.
  - After saving or deleting, it navigates the user to the detail page or the list page, respectively.
*/
