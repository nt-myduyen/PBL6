import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/src/widgets/container.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:http/http.dart' as http;
import 'package:itmentor/models/user.dart';
import 'package:itmentor/providers/user_provider.dart';
import 'package:itmentor/utils/constant.dart';
import 'package:provider/provider.dart';

class AppointmentDetailScreen extends StatefulWidget {
  final String accessToken;
  final String scheduleId;
  const AppointmentDetailScreen(
      {super.key, required this.accessToken, required this.scheduleId});

  @override
  State<AppointmentDetailScreen> createState() =>
      _AppointmentDetailScreenState();
}

class _AppointmentDetailScreenState extends State<AppointmentDetailScreen> {
  Future<Map<String, dynamic>> fetchData(User user) async {
    final apiUrl =
        Uri.https(Constants.uri, '/appointment/${widget.scheduleId}');
    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${user.accessToken}'
    };

    final response = await http.get(apiUrl, headers: headers);

    if (response.statusCode == 200) {
      // If the server returns a 200 OK response, parse the JSON
      print(json.decode(response.body));
      return json.decode(response.body);
    } else {
      // If the server did not return a 200 OK response, throw an exception.
      throw Exception('Failed to load data');
    }
  }

  @override
  Widget build(BuildContext context) {
    print("scheduleId: ${widget.scheduleId}");
    final user = Provider.of<UserProvider>(context).user;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: (() {
                    Navigator.pop(context);
                  }),
                  icon: const Icon(Icons.arrow_back),
                ),
                const Expanded(
                  child: Center(
                    child: Text(
                      'Chi tiết cuộc hẹn',
                      style: TextStyle(fontSize: 20),
                    ),
                  ),
                ),
              ],
            ),
            Expanded(
              child: FutureBuilder<Map<String, dynamic>>(
                future: fetchData(user),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Text('Error: ${snapshot.error}');
                  } else {
                    final data = snapshot.data;
                    return ListView(
                      padding: const EdgeInsets.all(16.0),
                      children: [
                        Text('Mentee: ${data!['mentee']['name']}'),
                        Text('Mentor: ${data['mentor']['name']}'),
                        Text('Start Date: ${data['schedule']['start_at']}'),
                        Text('End Date: ${data['schedule']['end_at']}'),
                        Text('Status: ${data['status']}'),
                      ],
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}