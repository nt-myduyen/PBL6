import 'dart:convert';

class User {
  String email;
  String password;
  String name;
  bool gender;
  String dateOfBirth;
  String phone;
  String avatar;
  String role;
  String id;
  String expiresIn;
  String accessToken;
  String refreshToken;
  String facebookLink;
  String skypeLink;

  User(
      {required this.avatar,
      required this.email,
      required this.password,
      required this.dateOfBirth,
      required this.gender,
      required this.phone,
      required this.role,
      required this.id,
      required this.expiresIn,
      required this.accessToken,
      required this.refreshToken,
      required this.name,
      required this.facebookLink,
      required this.skypeLink});

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'email': email,
      'password': password,
      'name': name,
      'gender': gender,
      'date_of_birth': dateOfBirth,
      'phone': phone,
      'avatar': avatar,
      'role': role,
      'expiresIn': expiresIn,
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'facebook_link': facebookLink,
      'skype_link': skypeLink
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
        email: map['email'] ?? '',
        password: map['password'] ?? '',
        name: map['name'] ?? '',
        gender: map['gender'] ?? false,
        dateOfBirth: map['date_of_birth'] ?? '',
        avatar: map['avatar'] ?? '',
        phone: map['phone'] ?? '',
        role: map['role'] ?? '',
        id: map['_id'] ?? '',
        expiresIn: map['expiresIn'] ?? '',
        accessToken: map['accessToken'] ?? '',
        refreshToken: map['refreshToken'] ?? '',
        facebookLink: map['facebook_link'] ?? '',
        skypeLink: map['skype_link'] ?? '');
  }

  String toJson() => json.encode(toMap());

  factory User.fromJson(String source) =>
      User.fromMap(json.decode(source) as Map<String, dynamic>);
}
