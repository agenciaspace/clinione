
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface PublicPageSettingsProps {
  clinicId: string;
  initialSlug: string | null;
  initialIsPublished: boolean | null;
  onUpdate: (data: { slug: string, isPublished: boolean }) => void;
}

const PublicPageSettings: React.FC<PublicPageSettingsProps> = ({ 
  clinicId, 
  initialSlug, 
  initialIsPublished,
  onUpdate 
}) => {
  const [slug, setSlug] = useState(initialSlug || '');
  const [isPublished, setIsPublished] = useState(initialIsPublished || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [clinicExists, setClinicExists] = useState(false);
  
  // Use the custom domain instead of the application base URL
  const baseUrl = "https://clini.one";

  // Verify if the clinic exists and is valid
  useEffect(() => {
    const checkClinic = async () => {
      if (!clinicId) {
        console.error("Clinic ID not provided");
        setClinicExists(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('id')
          .eq('id', clinicId)
          .single();
        
        if (error) {
          console.error("Clinic not found:", error);
          setClinicExists(false);
        } else {
          console.log("Clinic found:", data);
          setClinicExists(true);
        }
      } catch (error) {
        console.error("Error checking clinic:", error);
        setClinicExists(false);
      }
    };

    checkClinic();
  }, [clinicId]);

  const handlePublishToggle = async () => {
    if (!slug) {
      toast.error("Custom URL required", {
        description: "Please set a custom URL before publishing."
      });
      return;
    }

    if (!clinicExists) {
      toast.error("Clinic not found", {
        description: "Could not find the clinic to update."
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Updating publication status for clinic:", clinicId);
      
      const { error } = await supabase
        .from('clinics')
        .update({ 
          is_published: !isPublished,
          last_published_at: !isPublished ? new Date().toISOString() : null
        })
        .eq('id', clinicId);

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      setIsPublished(!isPublished);
      onUpdate({ slug, isPublished: !isPublished });
      
      toast.success(
        isPublished ? "Page unpublished" : "Page published", 
        {
          description: isPublished 
            ? "Your page is no longer publicly available." 
            : "Your page is now publicly available."
        }
      );
    } catch (error) {
      console.error('Error updating publication status:', error);
      toast.error("Error publishing", {
        description: "Could not update publication status. Please try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove special characters and replace spaces with hyphens
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    setSlug(value);
  };

  const handleSlugSave = async () => {
    if (!slug) {
      toast.error("Invalid URL", {
        description: "Please set a valid custom URL."
      });
      return;
    }

    if (!clinicExists) {
      toast.error("Clinic not found", {
        description: "Could not find the clinic to update."
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Updating slug for clinic:", clinicId);
      
      // Check if the slug already exists
      const { data: existingSlug, error: slugCheckError } = await supabase
        .from('clinics')
        .select('id')
        .eq('slug', slug)
        .neq('id', clinicId);

      if (slugCheckError) {
        console.error('Error checking existing slug:', slugCheckError);
        throw new Error("Error checking URL availability");
      }

      if (existingSlug && existingSlug.length > 0) {
        throw new Error("This URL is already in use by another clinic");
      }
      
      const { error } = await supabase
        .from('clinics')
        .update({ slug })
        .eq('id', clinicId);

      if (error) {
        console.error('Detailed error when updating slug:', error);
        throw error;
      }

      onUpdate({ slug, isPublished });
      
      toast.success("URL updated", {
        description: "Your clinic's custom URL has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error updating slug:', error);
      toast.error("Error updating URL", {
        description: error.message || "Could not update the custom URL."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format: clini.one/c/slug
  const publicUrl = slug ? `${baseUrl}/c/${slug}` : '';

  if (!clinicExists && clinicId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Public Page</CardTitle>
          <CardDescription>
            Configure and publish your clinic's public page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500 mb-2">Clinic not found</p>
            <p className="text-gray-500">
              You need to create or select a clinic before configuring the public page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Public Page</CardTitle>
        <CardDescription>
          Configure and publish your clinic's public page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug">Custom URL</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-gray-500 pr-1 whitespace-nowrap">{baseUrl}/c/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="your-clinic-name"
                    className="flex-1"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSlugSave} 
                disabled={isUpdating || slug === initialSlug || !slug}
              >
                Save URL
              </Button>
            </div>
          </div>

          {slug && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <a 
                    href={publicUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-healthblue-600 hover:underline"
                  >
                    {publicUrl}
                  </a>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    toast.success("URL copied", {
                      description: "The URL has been copied to the clipboard."
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <h4 className="font-medium">Page status</h4>
              <p className="text-sm text-gray-500">
                {isPublished 
                  ? "Your page is published and available to the public." 
                  : "Your page is not published and can only be seen by you."}
              </p>
            </div>
            <Button 
              onClick={handlePublishToggle}
              disabled={isUpdating || !slug}
              variant={isPublished ? "destructive" : "default"}
            >
              <Globe className="h-4 w-4 mr-2" />
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          </div>

          {isPublished && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Public Page
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicPageSettings;
