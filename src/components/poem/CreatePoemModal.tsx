import React, { useState } from "react";
import { X, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreatePoemModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (poem: {
    title: string;
    content: string;
    hashtags: string[];
  }) => void;
}

const CreatePoemModal = ({
  open = true,
  onOpenChange = () => {},
  onSubmit = () => {},
}: CreatePoemModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(["poetry", "emotions"]);

  const handleAddHashtag = () => {
    if (hashtag.trim() && !hashtags.includes(hashtag.trim())) {
      setHashtags([...hashtags, hashtag.trim()]);
      setHashtag("");
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
        hashtags,
      });
      // Reset form
      setTitle("");
      setContent("");
      setHashtags(["poetry", "emotions"]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Create New Poem
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the title of your poem"
              className="font-serif"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your poem here..."
              className="min-h-[250px] font-serif resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hashtags" className="text-sm font-medium">
              Hashtags
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="hashtags"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="Add a hashtag"
                className="flex-grow"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddHashtag}
                variant="outline"
                size="sm"
              >
                <Hash className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {hashtags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  // Save as draft functionality would go here
                  onOpenChange(false);
                }}
              >
                Save as Draft
              </Button>
              <Button type="submit" variant="default">
                Publish Poem
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePoemModal;
