import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, Link, useNavigate } from 'react-router-dom';

function CrewmateDetail({ session }) {
  const { id } = useParams(); // Get the crewmate ID from the URL
  const [crewmate, setCrewmate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCrewmate = async () => {
      setLoading(true);
      try {
        if (!session?.user?.id) {
          // If no user session, navigate to login or show message
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('teams') // 'teams' table is used for 'crewmates'
          .select('*')
          .eq('id', id) // Filter by the specific crewmate ID
          .single(); // Expect a single result

        if (error) {
          if (error.code === 'PGRST116') { // No rows found
            console.warn('Crewmate not found or not accessible:', id);
            setCrewmate(null); // Explicitly set to null
            alert('Crewmate not found or you do not have permission to view it.');
            navigate('/'); // Redirect to list if not found
          } else {
            throw error;
          }
        } else {
          setCrewmate(data);
        }
      } catch (error) {
        console.error('Error fetching crewmate details:', error.message);
        alert('Error fetching crewmate details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCrewmate();
    }
  }, [id, session, navigate]); // Re-fetch if ID or session changes

  if (loading) {
    return <div className="loading-message">Loading crewmate details...</div>;
  }

  if (!session?.user?.id) {
    return <div className="info-message">Please log in to view crewmate details.</div>;
  }

  if (!crewmate) {
    return <div className="info-message">Crewmate not found.</div>;
  }

  return (
    <div className="crewmate-detail-container">
      <h2>{crewmate.name}</h2>
      <p><strong>ID:</strong> {crewmate.id}</p>
      <p><strong>Created On:</strong> {new Date(crewmate.created_at).toLocaleString()}</p>
      <p>
        <strong>Members:</strong> {crewmate.members && crewmate.members.length > 0 ? crewmate.members.join(', ') : 'None yet'}
      </p>
      {/* Add more "extra information" here if your table had more columns */}
      <p>
        This is a dedicated detail page for {crewmate.name}. You can add more specific information or complex layouts here that wouldn't fit on the summary list.
      </p>

      <div className="detail-actions">
        <Link to={`/edit/${crewmate.id}`} className="button primary-button">Edit Crewmate</Link>
        <Link to="/" className="button secondary-button">Back to List</Link>
      </div>
    </div>
  );
}

export default CrewmateDetail;

/*
  Explanation:
  - This component displays detailed information for a single crewmate.
  - It uses `useParams` to get the `id` from the URL.
  - `useEffect` fetches the specific crewmate data from Supabase using `eq('id', id).single()`.
  - If the crewmate is not found (e.g., due to RLS or invalid ID), it redirects to the list.
  - A `Link` is provided to navigate to the edit page for this crewmate.
*/
