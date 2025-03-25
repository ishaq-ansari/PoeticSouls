import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import PoemCard from '../components/PoemCard';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Poem = Database['public']['Tables']['poems']['Row'] & {
  author: Profile;
  tags: { id: string; name: string }[];
};

const TagPage: React.FC = () => {
  const { tagName } = useParams<{ tagName: string }>();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tagCount, setTagCount] = useState(0);
  
  useEffect(() => {
    const fetchPoemsByTag = async () => {
      if (!tagName) return;
      
      setIsLoading(true);
      
      try {
        // Get tag ID
        const { data: tagData, error: tagError } = await supabase
          .from('tags')
          .select('*')
          .eq('name', tagName)
          .single();
        
        if (tagError) throw tagError;
        
        setTagCount(tagData.count);
        
        // Get poem IDs with this tag
        const { data: poemTags, error: poemTagsError } = await supabase
          .from('poem_tags')
          .select('poem_id')
          .eq('tag_id', tagData.id);
        
        if (poemTagsError) throw poemTagsError;
        
        if (poemTags.length === 0) {
          setPoems([]);
          setIsLoading(false);
          return;
        }
        
        // Get the actual poems
        const poemIds = poemTags.map((poemTag) => poemTag.poem_id);
        
        const { data: poemData, error: poemError } = await supabase
          .from('poems')
          .select(`
            *,
            author:profiles(*),
            tags:poem_tags(tag_id(id, name))
          `)
          .in('id', poemIds)
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        if (poemError) throw poemError;
        
        setPoems(poemData as unknown as Poem[]);
      } catch (error) {
        console.error('Error fetching poems by tag:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPoemsByTag();
  }, [tagName]);
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Tag size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
        <h1 className="text-2xl font-serif font-bold">#{tagName}</h1>
        <span className="ml-2 text-gray-600 dark:text-gray-400">({tagCount} poems)</span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : poems.length > 0 ? (
        <div>
          {poems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No poems found with this tag</p>
          <Link to="/write" className="btn btn-primary">
            Write a poem with this tag
          </Link>
        </div>
      )}
    </div>
  );
};

export default TagPage;