import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from './Screens/Login';
import Home from './Screens/Home';
import Register from './Screens/Register';
import Driver_register from './Screens/Driver_register';
import Customer_register from './Screens/Customer_register';
import Check_register from './Screens/Check_register';
import SplashScreen from './Screens/SplashScreen';
import UserDetails from './Screens/UserDetails';
import 'text-encoding-polyfill';
import MapScreen from './Screens/MapScreen';
import UserProfile from './Screens/UserProfile';
import RelationRequests from './Screens/RelationRequests'
import ChatList from './Screens/ChatList';
import ChatScreen from './Screens/ChatScreen';
import ContactUs from './Screens/ContactUs'
// import { BadgeProvider } from './BadgeContext';
import { BadgeProvider } from './Screens/context/BadgeContext';
import { useColorScheme } from 'react-native';
const Tab = createBottomTabNavigator();

const App = () => {
  const colorScheme = useColorScheme(); // دریافت حالت رنگ سیستم
  const isDarkMode = colorScheme === 'dark';
  const backgroundColor = isDarkMode ? '#1e1e1e' : '#f5f5f5';
  return (

    <NavigationContainer style={{ backgroundColor: backgroundColor }}>
      <BadgeProvider>
        <Tab.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{
            tabBarItemStyle: { padding: 20, backgroundColor: '#34D399' },
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="ContactUs"
            component={ContactUs}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="ChatList"
            component={ChatList}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="RelationRequests"
            component={RelationRequests}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="UserProfile"
            component={UserProfile}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="MapScreen"
            component={MapScreen}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="UserDetails"
            component={UserDetails}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />

          <Tab.Screen
            name="Register"
            component={Register}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="Driver_register"
            component={Driver_register}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="Customer_register"
            component={Customer_register}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="Check_register"
            component={Check_register}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              tabBarShowLabel: false,
              tabBarButton: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
        </Tab.Navigator>
      </BadgeProvider>
    </NavigationContainer>

  );
};

export default App;

