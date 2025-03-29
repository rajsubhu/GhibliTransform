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
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p>{user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Credits</h3>
                  <p className="text-2xl font-bold">{user.credits}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Instagram</h3>
                  <p>{user.instagram_username || 'Not connected'}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/credits">Buy Credits</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Instagram Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Earn Credits</CardTitle>
              <CardDescription>Verify your Instagram for bonus credits</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInstagram)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="instagram_username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your_instagram_handle"
                            {...field}
                            disabled={instagramMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your Instagram username to earn 2 additional credits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={instagramMutation.isPending}
                    className="w-full"
                  >
                    {instagramMutation.isPending ? 'Verifying...' : 'Verify & Earn Credits'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Your credits and transformations history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="credits" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
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
                      <Card key={transformation.id}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="aspect-video relative overflow-hidden rounded-md">
                              {transformation.transformed_image ? (
                                <img
                                  src={transformation.transformed_image}
                                  alt="Transformed image"
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-muted">
                                  <Badge variant="outline">{transformation.status}</Badge>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(transformation.created_at)}
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