<template>
  <div>
    <div class="row py-2">
      <div class="col-md-8 d-flex">
        <img :src="logo" class="avatar mx-md-4" />
        <div>
          <p class="title mb-0">
            <strong>
              {{
                data?.name ? 'Tên: ' :
                (data?.place ? 'Trường học: ' :
                (data?.company ? 'Công ty:  ' : ""))
              }}</strong>
            {{ data?.name || data?.place || data?.company || "" }}
          </p>
          <p class="sub-title mb-0">
            <strong>
              {{
                data?.major ? 'Chuyên ngành: ' :
                (data?.position ? 'Vị trí: ' : "")
              }}</strong>
            {{ data?.major || data?.position || "" }}
          </p>
          <p class="content">
            <strong>
              {{
                data?.content ? 'Chuyên ngành: ' :
                (data?.description ? 'Chi tiết: ' : "")
              }}</strong>
            {{ data?.content || data?.description || "" }}
          </p>
        </div>
      </div>
      <div class="col-md-4 text-end">
        <p v-if="data?.date">{{ formatDate(data?.date, "DD/MM/YYYY") }}</p>
        <p v-else-if="data?.start_date">
          {{
            `${formatDate(data?.start_date, "DD/MM/YYYY")} - ${formatDate(
              data?.end_date,
              "DD/MM/YYYY"
            )}`
          }}
        </p>
        <div
          v-if="showEdit"
          class="d-flex align-items-center justify-content-end"
        >
          <el-tooltip
            class="box-item"
            effect="light"
            content="Chỉnh sửa"
            placement="bottom"
          >
            <SvgIcon
              icon="edit"
              class="p-2 mr-2 bg-edit button"
              data-test-id="edit-experience"
              @click="toggleEdit"
            />
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="light"
            content="Xóa"
            placement="bottom"
          >
            <SvgIcon
              icon="delete"
              class="p-2 bg-delete button"
              @click="onDelete"
              data-test-id="delete-experience"
            />
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
  <ExperienceModal
    ref="experienceModal"
    :data="data"
    @updatedModal="() => updated()"
    :type="type"
    :bio="bio"
  />
  <EducationModal
    ref="educationModal"
    :data="data"
    @updatedModal="() => updated()"
    :type="type"
    :bio="bio"
  />
  <AwardModal
    ref="awardModal"
    :data="data"
    @updatedModal="() => updated()"
    :type="type"
    :bio="bio"
  />

  <SkillModal
    ref="skillModal"
    :data="data"
    @updatedModal="() => updated()"
    :type="type"
    :bio="bio"
  />
</template>

<script lang="ts" src="./ExperienceCard.ts"></script>
<style scoped lang="css" src="./style.css"></style>
