import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
}

const ChallengesPage: React.FC = () => {
  // Mock data for challenges
  const [challenges] = useState<Challenge[]>([
    {
      id: 'challenge-1',
      title: 'Echoes of Solitude',
      description: 'Write a poem that explores the beauty found in moments of solitude and self-reflection.',
      startDate: '2025-04-15',
      endDate: '2025-05-15',
      participants: 127,
    },
    {
      id: 'challenge-2',
      title: 'Whispers of Nature',
      description: 'Create a poem inspired by the natural world around you. Focus on the small details that often go unnoticed.',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      participants: 98,
    },
    {
      id: 'challenge-3',
      title: 'Memories in Motion',
      description: 'Craft a poem about a cherished memory, focusing on the emotions and sensations that bring it to life.',
      startDate: '2025-03-20',
      endDate: '2025-04-20',
      participants: 156,
    },
    {
      id: 'challenge-4',
      title: 'Urban Symphony',
      description: 'Write a poem that captures the rhythm and energy of city life, with all its contradictions and harmonies.',
      startDate: '2025-03-10',
      endDate: '2025-04-10',
      participants: 84,
    },
  ]);
  
  const activeDate = new Date();
  const activeChallenges = challenges.filter(
    (challenge) => new Date(challenge.endDate) >= activeDate
  );
  
  const pastChallenges = challenges.filter(
    (challenge) => new Date(challenge.endDate) < activeDate
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Poetry Challenges</h1>
        <Link to="/challenges/create" className="btn btn-primary">
          Propose Challenge
        </Link>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-serif font-bold mb-6">Active Challenges</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeChallenges.map((challenge) => (
            <div key={challenge.id} className="card p-6">
              <h3 className="text-xl font-serif font-bold mb-2">{challenge.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{challenge.description}</p>
              
              <div className="flex flex-wrap gap-y-2 mb-4">
                <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                </div>
                <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} className="mr-2" />
                  <span>
                    {Math.ceil(
                      (new Date(challenge.endDate).getTime() - activeDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days left
                  </span>
                </div>
                <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users size={16} className="mr-2" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>
              
              <Link
                to={`/challenge/${challenge.id}`}
                className="flex items-center justify-center w-full btn btn-primary"
              >
                <span>Join Challenge</span>
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          ))}
        </div>
        
        {activeChallenges.length === 0 && (
          <div className="text-center py-12 card">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No active challenges at the moment</p>
            <Link to="/challenges/create" className="btn btn-primary">
              Propose a Challenge
            </Link>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-serif font-bold mb-6">Past Challenges</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastChallenges.map((challenge) => (
            <div key={challenge.id} className="card p-6">
              <h3 className="text-xl font-serif font-bold mb-2">{challenge.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{challenge.description}</p>
              
              <div className="flex flex-wrap gap-y-2 mb-4">
                <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>Ended: {new Date(challenge.endDate).toLocaleDateString()}</span>
                </div>
                <div className="w-full sm:w-1/2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users size={16} className="mr-2" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>
              
              <Link
                to={`/challenge/${challenge.id}`}
                className="flex items-center justify-center w-full btn btn-outline"
              >
                <span>View Entries</span>
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          ))}
        </div>
        
        {pastChallenges.length === 0 && (
          <div className="text-center py-12 card">
            <p className="text-gray-600 dark:text-gray-400">No past challenges yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;