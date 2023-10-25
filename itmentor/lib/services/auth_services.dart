import 'dart:async';
import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:itmentor/models/user.dart';
import 'package:itmentor/providers/user_provider.dart';
import 'package:itmentor/screens/auth_screens/login_screen.dart';
import 'package:itmentor/screens/homepage_navigation_screen.dart';
import 'package:itmentor/screens/home_screens/homepage_screen.dart';
import 'package:itmentor/screens/splash_screen/splash_screen.dart';
import 'package:itmentor/screens/welcome_screen.dart';
import 'package:itmentor/utils/constant.dart';
import 'package:itmentor/utils/utils.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthServices {
  Future<void> signUpUser({
    required BuildContext context,
    required String email,
    required String password,
    required String name,
    required bool gender,
    required String dateOfBirth,
    required String phone,
    required String avatar,
    required String role,
  }) async {
    try {
      User user = User(
        email: email,
        password: password,
        name: name,
        gender: gender,
        dateOfBirth: dateOfBirth,
        phone: phone,
        avatar: avatar,
        role: role,
        id: '',
        expiresIn: '',
        accessToken: '',
        refreshToken: '',
      );

      final uri = Uri.https(Constants.uri, '/auth/register');

      http.Response res = await http.post(uri,
          body: user.toJson(),
          headers: <String, String>{
            'Content-Type': 'application/json; charset=utf-8'
          });

      print(res.statusCode);
      httpErrorHandle(
          response: res,
          context: context,
          onSuccess: (() {
            showSnackBar(context, 'Đăng ký thành công');
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(
                builder: (context) => const WelcomeScreen(),
              ),
              (route) => false,
            );
          }));
    } catch (e) {
      showSnackBar(context, 'Không thể đăng kí');
      print(e.toString());
    }
  }

  Future<void> signInUser({
    required BuildContext ctx,
    required String email,
    required String password,
  }) async {
    try {
      var userProvider = Provider.of<UserProvider>(ctx, listen: false);
      final navigator = Navigator.of(ctx);

      final uri = Uri.https(Constants.uri, '/auth/login');

      http.Response res = await http.post(
        uri,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      print(res.statusCode);
      httpErrorHandle(
        response: res,
        context: ctx,
        onSuccess: () async {
          SharedPreferences prefs = await SharedPreferences.getInstance();
          userProvider.setUser(res.body);
          await prefs.setString(
              'x-auth-token', jsonDecode(res.body)['accessToken']);
          navigator.pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (context) => const HomepageNavigationScreen(),
            ),
            (route) => false,
          );
        },
      );

      print(res.body);
      print(res.statusCode);
    } catch (e) {
      print(e.toString());
      showSnackBar(ctx, 'Sai tài khoản hoặc mật khẩu');
    }
  }

  Future<List<dynamic>> fetchMentors() async {
    final uri = Uri.https(Constants.uri, '/mentor');
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      Map<String, dynamic> responseData = json.decode(response.body);
      List<dynamic> mentors = responseData['mentors'];
      return mentors;
    } else {
      throw Exception('Failed to load mentors');
    }
  }

  Future<List<dynamic>> fetchBlogs(User user) async {
    // final uri = Uri.https(Constants.uri, '/blog');
    // final response = await http.get(uri);
    List<dynamic> blogs = [];

    final uri = Uri.https(Constants.uri, '/blog');

    http.Response response = await http.get(
      uri,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ${user.accessToken}'
      },
    );

    if (response.statusCode == 200) {
      blogs = json.decode(response.body)['blogs'];
      print(blogs);
      return blogs;
    } else {
      throw Exception('Failed to load blogs');
    }
  }

  Future<bool> getUserData(BuildContext context) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('x-auth-token');
      print('token: $token');

      if (token == null) {
        prefs.setString('x-auth-token', '');
        return false;
      }
      if (token == '') {
        return false;
      }
      return true;
    } catch (e) {
      showSnackBar(context, e.toString());
      return false; // You should return a value here in case of an error.
    }
  }

  void signOut(BuildContext context) async {
    final navigator = Navigator.of(context);
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('x-auth-token', '');
    navigator.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: ((context) => const SplashScreen()),
        ),
        (route) => false);
  }
}
