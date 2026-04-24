import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1520' }}>
        <ActivityIndicator color="#F5A623" size="large" />
      </View>
    );
  }

  return <Redirect href={loggedIn ? '/(tabs)' : '/(auth)/login'} />;
}
