import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function CrewmateList({ session }) {
  const [crewmates, setCrewmates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrewmates = async () => {
      setLoading(true);
      try {
        if (!session?.user?.id) {
          // If no user session, clear crewmates and stop loading
          setCrewmates([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('teams') // 'teams' table now represents 'crewmates'
          .select('*')
          .eq('user_id', session.user.id) // RLS will enforce this anyway, but good to filter
          .order('created_at', { ascending: false }); // Sort by creation date, most recent first

        if (error) {
          throw error;
        }
        setCrewmates(data || []);
      } catch (error) {
        console.error('Error fetching crewmates:', error.message);
        alert('Error fetching crewmates: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCrewmates();

    // Real-time subscription for changes to the 'teams' table for the current user
    const crewmateSubscription = supabase
      .channel('public:teams')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams', filter: `user_id=eq.${session?.user?.id}` },
        (payload) => {
          console.log('Change received for crewmates!', payload);
          if (payload.eventType === 'INSERT') {
            setCrewmates((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCrewmates((prev) =>
              prev.map((crewmate) => (crewmate.id === payload.old.id ? payload.new : crewmate))
            );
          } else if (payload.eventType === 'DELETE') {
            setCrewmates((prev) => prev.filter((crewmate) => crewmate.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(crewmateSubscription);
    };
  }, [session]); // Re-run effect if session changes


  const deleteCrewmate = async (crewmateId) => {
    if (!window.confirm('Are you sure you want to delete this crewmate?')) return;
    setLoading(true); // Set loading while deleting

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', crewmateId);

      if (error) {
        throw error;
      }
      // Realtime subscription will update the list, no need to manually setCrewmates
    } catch (error) {
      console.error('Error deleting crewmate:', error.message);
      alert('Error deleting crewmate: ' + error.message);
    } finally {
      setLoading(false); // Reset loading after deletion attempt
    }
  };


  if (loading) {
    return <div className="loading-message">Loading crewmates...</div>;
  }

  if (!session?.user?.id) {
    return <div className="info-message">Please log in to view your crewmates.</div>;
  }

  return (
    <div className="crewmate-list-container">
      <h2>Your Crewmates</h2>
      <Link to="/create" className="button primary-button">Add New Crewmate</Link>

      {crewmates.length === 0 ? (
        <p className="no-crewmates-message">You haven't created any crewmates yet. Click "Add New Crewmate" to get started!</p>
      ) : (
        <ul className="crewmate-list">
          {crewmates.map((crewmate) => (
            <li key={crewmate.id} className="crewmate-item">
              <Link to={`/crewmate/${crewmate.id}`} className="crewmate-link">
                <h3>{crewmate.name}</h3>
                <p>
                  Members: {crewmate.members && crewmate.members.length > 0
                    ? crewmate.members.join(', ')
                    : 'None yet'}
                </p>
                <p className="created-at">Created: {new Date(crewmate.created_at).toLocaleDateString()}</p>
              </Link>
              <div className="crewmate-actions">
                <Link to={`/edit/${crewmate.id}`} className="button secondary-button">Edit</Link>
                <button onClick={() => deleteCrewmate(crewmate.id)} className="button delete-button" disabled={loading}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CrewmateList;

/*
  Explanation:
  - This component fetches and displays a list of crewmates for the logged-in user.
  - It uses `useEffect` to fetch data and set up a real-time subscription.
  - `Link` components from `react-router-dom` are used to navigate to:
    - `/create` for adding a new crewmate.
    - `/crewmate/:id` for viewing a specific crewmate's details.
    - `/edit/:id` for editing a specific crewmate.
  - The `deleteCrewmate` function handles removing a crewmate from the database.
  - Sorting by `created_at` (descending) ensures the newest crewmates are at the top.
*/
