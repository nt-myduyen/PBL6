<template>
  <div class="table-wrapper w-100">
    <div
      class="table-header d-flex align-items-center justify-content-between mb-2"
    >
      <h1 class="title">News</h1>
      <ComboBox
        v-if="categories.length > 0"
        :options-prop="categories"
        :placeholder="'Select category'"
        @selection-change="handleSelect"
      />
      <SearchInput @search="handleSearch" />
      <nuxt-link to="/news/create">
        <button class="btn-custom btn-blue">Create news</button>
      </nuxt-link>
    </div>
    <hr class="mt-2 mb-0" />
    <div ref="table" class="table-overflow overflow-auto d-block h-90">
      <div class="layer-block"></div>
      <table class="table table-striped overflow-auto">
        <thead class="color-primary table-head">
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Category</th>
            <th scope="col">Date</th>
            <th scope="col">Published</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index" class="table-row">
            <td class="color-primary d-flex justify-content-center">
              <span class="td-content">
                <nuxt-link
                  :to="`/news/${item.id}`"
                  class="cursor-pointer color-primary"
                  @click="handleRouting(item.id)"
                  >{{ item.title.trim() }}</nuxt-link
                >
              </span>
            </td>
            <td class="color-secondary w-25 pt-16px">
              <div class="mx-auto">
                <span class="td-content">
                  <span :class="item.category_id ? 'category' : ''">{{
                    getCategoryName(item.category_id)
                  }}</span>
                </span>
              </div>
            </td>
            <td class="color-secondary w-25 pt-18px">
              {{ formatDateTime(item.created_at) }}
            </td>
            <td class="color-secondary w-25">
              <div class="switch-toggle">
                <label class="switch">
                  <input
                    v-model="item.published"
                    type="checkbox"
                    :disabled="item.category_id == null"
                    @click="markPublic(item.id)"
                  />
                  <span
                    class="slider round"
                    :class="item.category_id ? '' : 'cursor-default'"
                  ></span>
                </label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";
import SearchInput from "../uncommon/SearchInput.vue";
import ComboBox from "../uncommon/ComboBox.vue";

export default {
  components: {
    SearchInput,
    ComboBox,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters({
      categories: "newsCategory/getCategories",
    }),
  },
  mounted() {
    this.fetchCategoryList();
  },
  methods: {
    ...mapActions({
      fetchCategoryList: "newsCategory/fetchList",
    }),
    handleRouting(id) {
      this.$router.push(`/news/${id}`);
    },
    getCategoryName(id) {
      // console.log("id", id)
      const category = this.categories.find((item) => item.id === id);
      return category ? category.title : "-";
    },
    formatDateTime(date) {
      return moment(new Date(date)).format("DD.MM.YYYY HH:mm");
    },
    markPublic(id) {
      this.$api.news.markPublicNews(id).then((res) => {
        this.$toast.success("Change status public successfully!", {
          className: "my-toast",
        });
      });
    },
    handleSearch(content) {
      this.$emit("searchContent", content);
    },
    handleSelect(id) {
      this.$emit("selectCategory", id);
    },
    scrollToTop() {
      this.$refs.table.scrollTop = 0;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/toggle.scss";
.td-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 350px;
  // text-align: left;
  text-align: center;
  display: inline-block;
  padding-top: 6px;
}
.table {
  font-size: 14px;
  &-head {
    font-weight: 600;
  }
  &-row {
    &:hover {
      background-color: $color-blue-hover !important;
    }
  }
  input {
    width: 100%;
    height: 20px;
  }
}

hr {
  margin: 8px 0;
}
.pt-18px {
  padding-top: 18px !important;
}
.pt-16px {
  padding-top: 16px !important;
}
</style>
