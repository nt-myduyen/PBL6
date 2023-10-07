import { defineComponent, onMounted, ref, onBeforeUnmount } from "vue";
import SvgIcon from "../BUI/SvgIcon/SvgIcon.vue";
import avatar from "../../assets/image/avatar.png";
import icMentee from "../../assets/image/ic-mentee.png";
import icFollowed from "../../assets/image/followed.png";

export default defineComponent({
  name: "MentorCard",
  components: { SvgIcon },
  props: {
    mentor: {
      type: Object,
      required: true,
      default: () => ({
      }),
    },
  },
  setup() {
    const isTooltipRight = ref(true);
    const tooltipContainer = ref<HTMLElement | null>(null);

    onMounted(() => {
      checkTooltipPosition();
      window.addEventListener("resize", checkTooltipPosition);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", checkTooltipPosition);
    });

    const checkTooltipPosition = (): void => {
      const hoverTooltipRect =
        tooltipContainer?.value?.getBoundingClientRect().right;
      const tooltipRect = hoverTooltipRect! + 250;

      if (tooltipRect > window.innerWidth) {
        isTooltipRight.value = false;
      } else {
        isTooltipRight.value = true;
      }
    };

    return {
      avatar,
      icMentee,
      icFollowed,
      tooltipContainer,
      isTooltipRight,
    };
  },
});
