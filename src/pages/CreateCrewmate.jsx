import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function CreateCrewmate({ session }) {
  const [crewmateName, setCrewmateName] = useState('');
  const [crewmateAttributes, setCrewmateAttributes] = useState(''); // For free-form members
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle creating a new crewmate
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!crewmateName.trim()) {
      alert('Crewmate name cannot be empty.');
      return;
    }
    setLoading(true);

    try {
      const membersArray = crewmateAttributes
        .split(',')
        .map(m => m.trim())
        .filter(m => m !== ''); // Split by comma, trim, filter empty strings

      const { error } = await supabase
        .from('teams') // 'teams' table is used for 'crewmates'
        .insert([
          {
            user_id: session.user.id, // Associate with the current user
            name: crewmateName.trim(),
            members: membersArray
          }
        ]);

      if (error) {
        throw error;
      }

      alert('Crewmate created successfully!');
      navigate('/'); // Navigate back to the list page
    } catch (error) {
      console.error('Error creating crewmate:', error.message);
      alert('Error creating crewmate: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user?.id) {
    return <div className="info-message">Please log in to create crewmates.</div>;
  }

  return (
    <div className="create-crewmate-container">
      <h2>Create New Crewmate</h2>
      <form onSubmit={handleSubmit} className="crewmate-form">
        <label htmlFor="crewmateName">Crewmate Name:</label>
        <input
          id="crewmateName"
          type="text"
          placeholder="e.g., Captain Sparkle"
          value={crewmateName}
          onChange={(e) => setCrewmateName(e.target.value)}
          required
        />

        <label htmlFor="crewmateAttributes">Crewmate Members (comma-separated):</label>
        <input
          id="crewmateAttributes"
          type="text"
          placeholder="e.g., Pilot, Navigator, Engineer"
          value={crewmateAttributes}
          onChange={(e) => setCrewmateAttributes(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Crewmate'}
        </button>
      </form>
    </div>
  );
}

export default CreateCrewmate;

/*
  Explanation:
  - This component provides a form to create a new crewmate.
  - It uses `useState` for form inputs and loading state.
  - `handleSubmit` inserts the new crewmate data into the 'teams' table in Supabase,
    associating it with the logged-in user's ID.
  - After successful creation, it navigates the user back to the Crewmate List page (`/`).
  - Input for attributes (members) is free-form, comma-separated text.
*/
