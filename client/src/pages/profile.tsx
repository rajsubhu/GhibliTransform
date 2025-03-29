import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Instagram schema for the form
const instagramSchema = z.object({
  instagram_username: z.string().min(1, { message: 'Instagram username is required' }),
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function getReasonLabel(reason: string) {
  switch (reason) {
    case 'initial':
      return 'Initial credits';
    case 'instagram_follow':
      return 'Instagram follow bonus';
    case 'admin':
      return 'Admin grant';
    case 'generation':
      return 'Image generation';
    case 'purchase':
      return 'Credit purchase';
    default:
      return reason;
  }
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('credits');
  const { user, verifyInstagram } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const form = useForm<z.infer<typeof instagramSchema>>({
    resolver: zodResolver(instagramSchema),
    defaultValues: {
      instagram_username: user?.instagram_username || '',
    },
  });

  // Fetch user credits history
  const creditsQuery = useQuery({
    queryKey: ['/api/user/credits'],
    queryFn: async () => {
      return apiRequest('GET', '/api/user/credits');
    },
    enabled: !!user,
  });

  // Fetch user transformations
  const transformationsQuery = useQuery({
    queryKey: ['/api/user/transformations'],
    queryFn: async () => {
      return apiRequest('GET', '/api/user/transformations');
    },
    enabled: !!user,
  });

  // Instagram verification mutation
  const instagramMutation = useMutation({
    mutationFn: async (instagram_username: string) => {
      await verifyInstagram(instagram_username);
    },
    onSuccess: () => {
      toast({
        title: 'Instagram Verified',
        description: 'You have been awarded 2 additional credits!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Failed to verify Instagram username',
        variant: 'destructive',
      });
    },
  });

  const onSubmitInstagram = (values: z.infer<typeof instagramSchema>) => {
    instagramMutation.mutate(values.instagram_username);
  };

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
      <div className="flex flex-col gap-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info Card */}
          <Card className="bg-white shadow-lg border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-primary">Profile Information</CardTitle>
              <CardDescription>Your account details and current credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Email</h3>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Available Credits</h3>
                  <div className="flex items-center mt-1">
                    <p className="text-3xl font-bold text-primary">{user.credits}</p>
                    <Badge variant="outline" className="ml-2 px-3 py-0.5">credits</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Instagram</h3>
                  {user.instagram_username ? (
                    <Badge variant="secondary" className="font-medium text-sm">
                      @{user.instagram_username}
                    </Badge>
                  ) : (
                    <p className="text-muted-foreground italic">Not connected</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/credits">Buy More Credits</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Instagram Verification Card */}
          <Card className="bg-white shadow-lg border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-primary">Get Free Credits</CardTitle>
              <CardDescription>One-time Instagram verification bonus</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInstagram)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="instagram_username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Instagram Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="username (without @)"
                            {...field}
                            disabled={instagramMutation.isPending || !!user.instagram_username}
                          />
                        </FormControl>
                        <FormDescription>
                          Verify your Instagram to earn <Badge variant="outline">+2 credits</Badge>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={instagramMutation.isPending || !!user.instagram_username}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {instagramMutation.isPending ? 'Verifying...' : 
                     user.instagram_username ? 'Already Verified' : 'Verify & Get 2 Credits'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Card className="bg-white shadow-lg border-none mt-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-primary">Activity History</CardTitle>
            <CardDescription>Your credits and transformations history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="credits" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="credits">Credits History</TabsTrigger>
                <TabsTrigger value="transformations">Transformations</TabsTrigger>
              </TabsList>

              {/* Credits History Tab */}
              <TabsContent value="credits">
                {creditsQuery.isLoading ? (
                  <div className="py-8 text-center">Loading credits history...</div>
                ) : creditsQuery.isError ? (
                  <div className="py-8 text-center text-destructive">
                    Error loading credits history
                  </div>
                ) : creditsQuery.data?.transactions?.length === 0 ? (
                  <div className="py-8 text-center">No credit transactions yet</div>
                ) : (
                  <Table>
                    <TableCaption>A history of your credit transactions</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditsQuery.data?.transactions?.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                          <TableCell>{getReasonLabel(transaction.reason)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={transaction.amount > 0 ? 'default' : 'destructive'}>
                              {transaction.amount > 0 ? '+' : ''}
                              {transaction.amount}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Transformations Tab */}
              <TabsContent value="transformations">
                {transformationsQuery.isLoading ? (
                  <div className="py-8 text-center">Loading transformations...</div>
                ) : transformationsQuery.isError ? (
                  <div className="py-8 text-center text-destructive">
                    Error loading transformations
                  </div>
                ) : transformationsQuery.data?.length === 0 ? (
                  <div className="py-8 text-center">No transformations yet</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {transformationsQuery.data?.map((transformation: any) => (
                      <Card key={transformation.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                        <CardContent className="p-0">
                          <div className="relative">
                            <div className="aspect-square relative overflow-hidden">
                              {transformation.transformed_image ? (
                                <img
                                  src={transformation.transformed_image}
                                  alt="Transformed image"
                                  className="object-cover w-full h-full hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-muted p-4">
                                  <Badge variant="outline" className="px-3 py-1">
                                    {transformation.status || 'Processing'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-white">
                              <div className="flex justify-between items-center">
                                <Badge variant="secondary" className="font-medium">
                                  Ghibli Style
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(transformation.created_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}