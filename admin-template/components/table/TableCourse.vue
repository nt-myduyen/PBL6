<template>
  <div>
    <div class="table-header d-flex flex-wrap align-items-center justify-content-between mb-2 gap-4">
      <h1 class="title">{{ title }}</h1>
      <SearchInput @search="handleSearch" />
    </div>
    <div class="table-wrapper w-100 position-relative">
      <div class="layer-new-block"></div>
      <div ref="table" class="table-overflow overflow-auto d-block h-90">
        <table class="table table-striped">
          <thead class="color-primary table-head">
            <tr>
              <th scope="col" class="text-start">Image</th>
              <th scope="col" class="text-start">Title</th>
              <th scope="col" class="text-start col-4">Description</th>
              <th scope="col" class="text-start col-2">Price</th>
              <th scope="col" class="text-start">Discount</th>
              <th scope="col" class="text-start">Creator</th>
              <!-- <th scope="col" class="text-start">Number of students</th> -->
              <!-- <th scope="col" class="text-start">Number of lessons</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data" :key="index" class="cursor-pointer" @click="handleRouting(item?._id)">
              <td class="text-start">
                <img v-if="item?.image" class="avatar" :src="item?.image" />
              </td>
              <td class="color-primary text-start">
                <span class="td-content">
                  <nuxt-link :to="`/course/${item?._id}`" class="cursor-pointer color-primary text-break">{{ item?.title
                  }}</nuxt-link>
                </span>
              </td>
              <td class="color-secondary text-start">
                <span class="td-content text-break">{{
                  item?.description
                }}</span>
              </td>
              <td class="color-secondary text-start">
                <span class="td-content text-break">{{ item?.price ? item?.price : 0 }} VNĐ</span>
              </td>
              <td class="color-secondary text-start">
                <span class="td-content text-break">{{ item?.discount ? item?.discount : 0 }} VNĐ</span>
              </td>
              <td class="color-secondary text-start">
                <span class="td-content text-break">{{
                  item?.creator.name
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import SearchInput from "../uncommon/SearchInput.vue";
// import ComboBox from "../uncommon/ComboBox.vue";

export default {
  components: {
    SearchInput,
    // ComboBox,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "Quản lý khóa học",
    },
  },
  data() {
    return { courseList: [] };
  },
  mounted() {
    this.getListCourse();
  },
  methods: {
    getListCourse() {
      this.$api.contact.getListCourse().then((res) => {
        this.courseList = res?.data.courses ? res?.data.courses : [];
      });
      this.$router.push({ query: this.params });
    },

    handleRouting(id) {
      this.$router.push(`/course/${id}`);
    },

    handleSearch(content) {
      this.$emit("searchContent", content);
    },

    // handleSelect(expertise) {
    //   this.$emit("changeSelect", expertise);
    // },
  },
};
</script>
<style lang="scss" scoped>
.td-content {
  justify-content: center;
  display: inline-block;
}

.table {
  font-size: 14px;

  &-head {
    font-weight: 600;
  }

  &-row {
    margin: 8px 0;

    &:hover {
      background-color: $color-blue-hover !important;
    }

    &:first-child {
      margin-top: 0;
    }
  }

  td {
    word-break: break-all;
  }
}

hr {
  margin: 8px 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.text-start {
  text-align: start;
}
</style>
