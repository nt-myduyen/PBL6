import { defineComponent, onMounted, ref, watch, type Ref } from "vue";
import personLogo from "../../assets/image/ic-mentee.png";
import heartLogo from "../../assets/image/followed.png";
import ratingLogo from "../../assets/image/rating.png";
import hourLogo from "../../assets/image/hour.png";
import coverImg from "../../assets/image/cover.jpg";
import avatarImg from "../../assets/image/cover.jpg";
import advertisementImg from "../../assets/image/advertisement.jpg";
import GuestLayout from "../../layout/GuestLayout/GuestLayout.vue";
import MentorPost from "../../components/MentorPost/MentorPost.vue";
import ExperienceCard from "./element/ExperienceCard.vue";
import { useUser } from "../../stores/user";
import { useMentors } from "../../stores/mentors";
import { useAuth } from "../../stores/auth";
import SwalPopup from "../../ultils/swalPopup";
import { getUserInfo } from "../../ultils/cache/localStorage";
import router from "../../router";
import AppointmentModal from "./element/AppointmentModal/index.vue";

export default defineComponent({
  name: "UserInformation",
  components: { GuestLayout, MentorPost, ExperienceCard, AppointmentModal },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props: any) {
    const userStore = useUser();
    const mentorsStore = useMentors();
    const authStore = useAuth();
    const selectedOption = ref("profile");
    const userInfo = ref();
    const mentors = ref([]);
    const showEdit = getUserInfo()?._id == props.id;
    const appointmentModal: Ref<any> = ref<typeof AppointmentModal | null>(
      null
    );

    onMounted(() => {
      getUserInformation(props.id);
      getAllMentors();
    });

    const getUserInformation = (id: string) => {
      userStore.requestGetUserInfo({
        id: props.id,
        callback: {
          onSuccess: (res) => {
            userInfo.value = res;
          },
          onFailure: () => {
            SwalPopup.swalResultPopup(
              "Sorry, looks like there are some errors detected, please try again.",
              "error"
            );
          },
        },
      });
    };

    watch(
      () => props.id,
      (newId, oldId) => {
        getUserInformation(newId);
      }
    );

    const getAllMentors = () => {
      mentorsStore.requestGetAllMentors({
        callback: {
          onSuccess: (res) => {
            mentors.value = res
              .filter((item: any) => item._id != props?.id)
              .slice(0, 5);
          },
          onFailure: () => {
            SwalPopup.swalResultPopup(
              "Sorry, looks like there are some errors detected, please try again.",
              "error"
            );
          },
        },
      });
    };

    const bookAppointment = () => {
      if (authStore.isLoggedIn()) {
        router.push({ hash: "#step=1" });
        appointmentModal?.value?.show();
      } else {
        router.push("/sign-in");
      }
    };

    return {
      personLogo,
      heartLogo,
      coverImg,
      avatarImg,
      ratingLogo,
      hourLogo,
      advertisementImg,
      selectedOption,
      userInfo,
      showEdit,
      mentors,
      router,
      appointmentModal,
      getUserInfo,
      bookAppointment,
    };
  },
});