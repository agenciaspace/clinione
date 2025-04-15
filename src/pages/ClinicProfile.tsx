
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Upload, Facebook, Instagram, Globe, Clock, MapPin, Phone, Mail, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/integrations/supabase/client";
import PublicPageSettings from '@/components/clinic/PublicPageSettings';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the expected structure for working hours
type WorkingHourPeriod = { start: string; end: string }[];

type WorkingHours = {
  monday: WorkingHourPeriod;
  tuesday: WorkingHourPeriod;
  wednesday: WorkingHourPeriod;
  thursday: WorkingHourPeriod;
  friday: WorkingHourPeriod;
  saturday: WorkingHourPeriod;
  sunday: WorkingHourPeriod;
};

type Clinic = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  about: string; // maps to description in DB
  socialMedia: {
    facebook: string | null;
    instagram: string | null;
  };
  workingHours: WorkingHours;
  is_published: boolean | null;
};

// Default working hours template
const defaultWorkingHours: WorkingHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '08:00', end: '12:00' }],
  sunday: [],
};

// Create clinic form schema
const createClinicSchema = z.object({
  name: z.string().min(3, "Clinic name must have at least 3 characters"),
  slug: z.string().min(3, "Slug must have at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens are allowed")
    .optional(),
  description: z.string().optional(),
});

type CreateClinicFormValues = z.infer<typeof createClinicSchema>;

const ClinicProfile: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Set up the form for creating new clinics
  const createClinicForm = useForm<CreateClinicFormValues>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Fetch all clinics for the current user
  useEffect(() => {
    const fetchClinics = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching clinics:", error);
          setClinics([]);
        } else if (data && data.length > 0) {
          console.log("Clinics found:", data);
          
          const formattedClinics = data.map(clinicData => ({
            id: clinicData.id,
            name: clinicData.name,
            slug: clinicData.slug,
            logo: clinicData.logo,
            address: clinicData.address,
            phone: clinicData.phone,
            email: clinicData.email,
            website: clinicData.website,
            about: clinicData.description || '',
            socialMedia: {
              facebook: clinicData.facebook_id || '',
              instagram: clinicData.instagram_id || '',
            },
            workingHours: clinicData.working_hours || defaultWorkingHours,
            is_published: clinicData.is_published
          }));
          
          setClinics(formattedClinics);
          
          // Select the first clinic by default
          if (formattedClinics.length > 0 && !selectedClinicId) {
            setSelectedClinicId(formattedClinics[0].id);
            setClinic(formattedClinics[0]);
            setFormData(formattedClinics[0]);
          }
        } else {
          console.log("No clinics found");
          setClinics([]);
        }
      } catch (error) {
        console.error("Error:", error);
        setClinics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // Update selected clinic when it changes
  useEffect(() => {
    if (selectedClinicId && clinics.length > 0) {
      const selectedClinic = clinics.find(c => c.id === selectedClinicId);
      if (selectedClinic) {
        setClinic(selectedClinic);
        setFormData(selectedClinic);
      }
    }
  }, [selectedClinicId, clinics]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      socialMedia: { ...formData.socialMedia, [name]: value }
    });
  };

  const handleWorkingHoursChange = (day: string, period: 'start' | 'end', value: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: formData.workingHours[day as keyof typeof formData.workingHours].map((_, i) => 
          i === 0 ? { ...formData.workingHours[day as keyof typeof formData.workingHours][0], [period]: value } : _
        )
      }
    });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !selectedClinicId) {
      toast.error("No clinic selected", {
        description: "Please select a clinic to update."
      });
      return;
    }
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.about,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        facebook_id: formData.socialMedia?.facebook,
        instagram_id: formData.socialMedia?.instagram,
        working_hours: formData.workingHours,
      };
      
      console.log("Updating clinic with ID:", selectedClinicId);
      console.log("Update data:", updateData);
      
      const { error, data } = await supabase
        .from('clinics')
        .update(updateData)
        .eq('id', selectedClinicId)
        .select();
      
      console.log("Update result:", data);
      
      if (error) {
        console.error("Detailed error:", error);
        throw error;
      }
      
      // Update the clinic in the list
      setClinics(prev => 
        prev.map(c => c.id === selectedClinicId ? { ...c, ...formData } : c)
      );
      
      setClinic(formData);
      setIsEditing(false);
      
      toast("Profile updated", {
        description: "Clinic information has been successfully updated."
      });
    } catch (error) {
      console.error("Error updating clinic:", error);
      toast.error("Error updating", {
        description: "An error occurred while updating the clinic information."
      });
    }
  };

  const handlePublicPageUpdate = ({ slug, isPublished }: { slug: string, isPublished: boolean }) => {
    if (!clinic) return;
    
    const updatedClinic = {
      ...clinic,
      slug,
      is_published: isPublished
    };
    
    setClinic(updatedClinic);
    
    if (formData) {
      setFormData({
        ...formData,
        slug,
        is_published: isPublished
      });
    }
    
    // Update the clinic in the list
    setClinics(prev => 
      prev.map(c => c.id === selectedClinicId ? updatedClinic : c)
    );
  };

  const handleCreateClinic = async (values: CreateClinicFormValues) => {
    try {
      setIsCreating(true);
      
      // Format the data for Supabase
      const newClinicData = {
        name: values.name,
        description: values.description || '',
        slug: values.slug || undefined,
        working_hours: defaultWorkingHours
      };
      
      console.log("Creating new clinic:", newClinicData);
      
      const { data, error } = await supabase
        .from('clinics')
        .insert(newClinicData)
        .select();
      
      if (error) {
        console.error("Error creating clinic:", error);
        throw error;
      }
      
      console.log("Clinic created:", data);
      
      // Format the new clinic
      if (data && data.length > 0) {
        const newClinic: Clinic = {
          id: data[0].id,
          name: data[0].name,
          slug: data[0].slug,
          logo: data[0].logo,
          address: data[0].address,
          phone: data[0].phone,
          email: data[0].email,
          website: data[0].website,
          about: data[0].description || '',
          socialMedia: {
            facebook: data[0].facebook_id || '',
            instagram: data[0].instagram_id || '',
          },
          workingHours: data[0].working_hours || defaultWorkingHours,
          is_published: data[0].is_published
        };
        
        // Add to clinics list
        setClinics([newClinic, ...clinics]);
        
        // Select the new clinic
        setSelectedClinicId(newClinic.id);
        setClinic(newClinic);
        setFormData(newClinic);
        
        toast.success("Clinic created", {
          description: "Your new clinic has been successfully created."
        });
        
        // Reset form and close dialog
        createClinicForm.reset();
        setIsCreating(false);
        
        return true;
      }
    } catch (error: any) {
      console.error("Error creating clinic:", error);
      toast.error("Error creating clinic", {
        description: error.message || "An error occurred while creating the clinic."
      });
    } finally {
      setIsCreating(false);
    }
    
    return false;
  };

  const weekdays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthblue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clinic data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Profile</h1>
          <p className="text-gray-500">Manage your clinic information</p>
        </div>
        <div className="flex gap-2">
          {clinics.length > 0 && (
            <div className="flex items-center mr-2">
              <Label htmlFor="clinic-select" className="mr-2">Clinic:</Label>
              <select 
                id="clinic-select"
                className="border rounded-md px-3 py-2 text-sm"
                value={selectedClinicId || ''}
                onChange={(e) => setSelectedClinicId(e.target.value)}
              >
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Clinic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
                <DialogDescription>
                  Enter the details for your new clinic.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createClinicForm}>
                <form onSubmit={createClinicForm.handleSubmit(handleCreateClinic)} className="space-y-4">
                  <FormField
                    control={createClinicForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter clinic name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom URL</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="text-gray-500 pr-1">clini.one/c/</span>
                            <Input 
                              {...field} 
                              placeholder="your-clinic-name" 
                              onChange={e => {
                                // Sanitize slug while typing
                                const sanitizedSlug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '-')
                                  .replace(/-+/g, '-')
                                  .replace(/^-|-$/g, '');
                                field.onChange(sanitizedSlug);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This will be the public URL for your clinic page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Description of your clinic"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Clinic"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {clinic && (
            <Button 
              variant={isEditing ? "outline" : "default"} 
              onClick={() => {
                if (isEditing) {
                  setFormData(clinic); // Reset form data
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </div>
      </div>
      
      {clinics.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">No Clinics Yet</h2>
          <p className="text-gray-600 text-center mb-4">
            You haven't created any clinics yet. Start by adding your first clinic.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Clinic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
                <DialogDescription>
                  Enter the details for your new clinic.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createClinicForm}>
                <form onSubmit={createClinicForm.handleSubmit(handleCreateClinic)} className="space-y-4">
                  <FormField
                    control={createClinicForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter clinic name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom URL</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="text-gray-500 pr-1">clini.one/c/</span>
                            <Input 
                              {...field} 
                              placeholder="your-clinic-name" 
                              onChange={e => {
                                // Sanitize slug while typing
                                const sanitizedSlug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '-')
                                  .replace(/-+/g, '-')
                                  .replace(/^-|-$/g, '');
                                field.onChange(sanitizedSlug);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This will be the public URL for your clinic page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createClinicForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Description of your clinic"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Clinic"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      ) : clinic ? (
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Basic Information</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="public">Public Page</TabsTrigger>
            <TabsTrigger value="preview">Preview Page</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Clinic Details</CardTitle>
                  <CardDescription>
                    Basic information about your clinic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Clinic Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData?.name || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="about">About the Clinic</Label>
                        <Textarea
                          id="about"
                          name="about"
                          value={formData?.about || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="mt-6">
                        Save Changes
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Logo</CardTitle>
                  <CardDescription>
                    Your clinic logo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    {clinic.logo ? (
                      <div className="relative w-40 h-40">
                        <img
                          src={clinic.logo}
                          alt={`Logo for ${clinic.name}`}
                          className="w-full h-full object-contain"
                        />
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute bottom-0 right-0"
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400">
                        <Upload className="h-10 w-10 mb-2" />
                        <p className="text-sm">Clinic Logo</p>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How patients can contact your clinic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData?.address || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData?.phone || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData?.email || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData?.website || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="mt-6">
                        Save Changes
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>
                    Connect your clinic to social media
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <Label htmlFor="facebook">Facebook</Label>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 pr-1">facebook.com/</span>
                        <Input
                          id="facebook"
                          name="facebook"
                          value={formData?.socialMedia?.facebook || ''}
                          onChange={handleSocialMediaChange}
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <Label htmlFor="instagram">Instagram</Label>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 pr-1">instagram.com/</span>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={formData?.socialMedia?.instagram || ''}
                          onChange={handleSocialMediaChange}
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="mt-6">
                        Save Changes
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>
                  Set your clinic's operating hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveChanges} className="space-y-4">
                  {weekdays.map((day) => (
                    <div key={day.key} className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4">
                      <div className="sm:col-span-1 font-medium">{day.label}</div>
                      
                      {formData?.workingHours[day.key as keyof typeof formData.workingHours]?.length > 0 ? (
                        <>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`${day.key}-start`} className="sr-only">Start Time</Label>
                            <Input
                              id={`${day.key}-start`}
                              type="time"
                              value={formData?.workingHours[day.key as keyof typeof formData.workingHours][0]?.start || ''}
                              onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="text-center">to</div>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`${day.key}-end`} className="sr-only">End Time</Label>
                            <Input
                              id={`${day.key}-end`}
                              type="time"
                              value={formData?.workingHours[day.key as keyof typeof formData.workingHours][0]?.end || ''}
                              onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-4 text-gray-500 italic">
                          Closed
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <Button type="submit" className="mt-6">
                      Save Changes
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="public">
            <div className="max-w-2xl mx-auto">
              <PublicPageSettings 
                clinicId={clinic.id}
                initialSlug={clinic.slug}
                initialIsPublished={clinic.is_published}
                onUpdate={handlePublicPageUpdate}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Public Page Preview</CardTitle>
                  <CardDescription>
                    How your page will look to visitors
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigate('/dashboard/public-page');
                  }}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  View Preview
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-healthblue-100 rounded-full flex items-center justify-center text-healthblue-600 font-bold text-lg">
                        {clinic.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{clinic.name}</h2>
                        <p className="text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {clinic.address ? clinic.address.split(',')[0] : "No address provided"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button>Book Appointment</Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold mb-2">About the Clinic</h3>
                      <p className="text-gray-600">{clinic.about || "No description provided"}</p>
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Contact</h3>
                        <div className="space-y-2">
                          {clinic.phone && (
                            <p className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-healthblue-500" />
                              {clinic.phone}
                            </p>
                          )}
                          {clinic.email && (
                            <p className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2 text-healthblue-500" />
                              {clinic.email}
                            </p>
                          )}
                          {clinic.website && (
                            <p className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2 text-healthblue-500" />
                              {clinic.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-healthblue-500" />
                          Hours
                        </h3>
                        
                        <div className="space-y-2">
                          {weekdays.map((day) => (
                            <div key={day.key} className="flex justify-between">
                              <span className="text-gray-600">{day.label}</span>
                              <span className="font-medium">
                                {clinic.workingHours[day.key as keyof typeof clinic.workingHours]?.length > 0 
                                  ? `${clinic.workingHours[day.key as keyof typeof clinic.workingHours][0].start} - ${clinic.workingHours[day.key as keyof typeof clinic.workingHours][0].end}`
                                  : 'Closed'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <p className="text-gray-500">Please select a clinic to view its details</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClinicProfile;
