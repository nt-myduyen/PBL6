import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:itmentor/utils/constant.dart';
import 'package:itmentor/utils/utils.dart';
import 'package:video_player/video_player.dart';
import 'package:url_launcher/url_launcher.dart' as launcher;

class CourseDetail extends StatefulWidget {
  final String courseId;
  final String token;
  const CourseDetail({super.key, required this.courseId, required this.token});

  @override
  State<CourseDetail> createState() => _CourseDetailState();
}

class _CourseDetailState extends State<CourseDetail> {
  // late List<dynamic> courseDetails;
  Map<String, dynamic> course = {};
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    fetchData(widget.courseId);
  }

  Future<void> fetchData(String courseId) async {
    setState(() {
      isLoading = true;
    });
    final apiUrl = Uri.https(Constants.uri, '/course/$courseId');
    final response = await http.get(apiUrl);

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      setState(() {
        course = data;
        isLoading = false;
      });
    } else {
      setState(() {
        isLoading = false;
      });
      throw Exception('Failed to load data');
    }
  }

  VideoPlayerController? _videoPlayerController;
  ChewieController? _chewieController;

  @override
  void dispose() {
    _videoPlayerController?.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  Widget _buildVideoPlayer(String videoUrl) {
    _videoPlayerController = VideoPlayerController.network(videoUrl);
    _chewieController = ChewieController(
      showControls: true,
      showOptions: true,
      videoPlayerController: _videoPlayerController!,
      autoPlay: false,
      looping: false,
      aspectRatio: 16 / 9,
      errorBuilder: (context, errorMessage) {
        return Center(
          child: Text(
            'Error loading video: $errorMessage',
            style: TextStyle(color: Colors.white),
          ),
        );
      },
    );

    return Chewie(
      controller: _chewieController!,
    );
  }

  Future<void> requestPayment(String courseId, String token) async {
    // final String apiUrl = 'https://pbl6-production.up.railway.app/payment/';
    final uri = Uri.https(Constants.uri, '/payment/');

    // Prepare the request body
    final Map<String, dynamic> requestBody = {
      "course": courseId,
    };

    // Prepare headers
    final Map<String, String> headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };

    try {
      // Make the API call
      final response = await http.post(
        uri,
        headers: headers,
        body: jsonEncode(requestBody),
      );

      // Handle the response
      if (response.statusCode == 201) {
        // Request successful, handle the response as needed
        print('API Call successful');
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final String paymentUrl = responseData['url'];
        debugPrint(paymentUrl);

        _launchUrl(paymentUrl);
      } else {
        print('API Call failed with status code: ${response.statusCode}');
      }
    } catch (error) {
      print('Error during API call: $error');
    }
  }

  Future<void> _launchUrl(String url) async {
    final Uri _url = Uri.parse(url);
    if (!await launcher.launchUrl(_url)) {
      throw Exception('Could not launch $_url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 94, 157, 144),
        elevation: 0,
        title: const Text(
          'Chi tiết khoá học',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: isLoading == true
          ? Center(child: CircularProgressIndicator())
          : SafeArea(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Image.network(course['image']),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ListTile(
                            leading: CircleAvatar(
                              backgroundImage: CachedNetworkImageProvider(
                                course['creator']['avatar'],
                              ),
                              radius: 30, // Adjust the radius as needed
                            ),
                            title: const Text('Giảng viên'),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(course['creator']['name']),
                                Text(
                                    'Chuyên ngành: ${course['creator']['expertise']['name']}')
                              ],
                            ),
                          ),
                          const SizedBox(
                            height: 10,
                          ),
                          ListTile(
                            title: const Text(
                              'Mô tả',
                              style: TextStyle(
                                fontSize: 18, // Adjust the font size
                                fontWeight:
                                    FontWeight.bold, // Make the text bold
                                color: Colors.blue, // Change the text color
                              ),
                            ),
                            subtitle: Text(
                              course['description'],
                              style: const TextStyle(
                                fontSize: 16, // Adjust the font size
                                color: Colors.grey, // Change the text color
                              ),
                            ),
                          ),
                          ListTile(
                            title: Text(
                              'Giá',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ),
                            ),
                            subtitle: Text(
                              NumberFormat.decimalPattern()
                                      .format(course['price']) +
                                  ' VND',
                              style: TextStyle(
                                fontSize: 16,
                                color: course['price'] != 0 ?  Color.fromARGB(255, 213, 29, 109) : Colors.green,
                              ),
                            ),
                          ),
                          course['price'] == 0
                              ? Container(
                                  margin: const EdgeInsets.only(left: 16),
                                  child: Text(
                                    'Danh sách bài học:',
                                    style: TextStyle(fontSize: 15),
                                  ))
                              : SizedBox(),
                          (course['price'] == 0)
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    for (var lesson in course['lessons'])
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          ListTile(
                                            title: const Text('Tên bài học'),
                                            subtitle: Text(lesson['title']),
                                          ),
                                          ListTile(
                                            title: const Text('Mô tả bài học'),
                                            subtitle:
                                                Text(lesson['description']),
                                          ),
                                          const Divider(),
                                          if (lesson['video'] != null)
                                            _buildVideoPlayer(lesson['video']),
                                        ],
                                      ),
                                  ],
                                )
                              : Center(
                                  child: ElevatedButton(
                                    key: const Key('ButtonAddExperience'),
                                    // onPressed: () {
                                    //   // requestPayment(
                                    //   //     widget.courseId, widget.token);
                                    //   _launchUrl();
                                    // },
                                    onPressed: () {
                                      requestPayment(
                                          widget.courseId, widget.token);
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color.fromARGB(
                                          255, 63, 143, 125),
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(20.0),
                                      ),
                                    ),
                                    child: const Text('Mua khoá học'),
                                  ),
                                ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
