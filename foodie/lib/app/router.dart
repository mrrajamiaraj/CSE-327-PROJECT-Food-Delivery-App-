import 'package:go_router/go_router.dart';
import '../features/splash/view/splash_page.dart';
import '../features/home/view/home_page.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashPage()),
    GoRoute(path: '/home', builder: (_, __) => const HomePage()),
  ],
);
