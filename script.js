const url = "https://hexschool.github.io/js-filter-data/data.json";
const showList = document.querySelector(".showList");
const showResult = document.querySelector(".show-result");
const searchInput = document.querySelector("#crop");
const btnSearch = document.querySelector(".search");
const btnGroup = document.querySelector(".button-group");
const sortSelected = document.querySelector(".sort-select");
const sortMobile = document.querySelector(".mobile-select");
const sortAdvanced = document.querySelector(".js-sort-advanced");
const pagination = document.querySelector(".table-page");

let data = []; //儲存從API取得資料
let filteredData = []; //儲存分類後的資料
let search_type = ""; //儲存當前搜尋類別

//資料分頁用
let currentPage = 1; // 儲存當前頁面
let currentPageGroup = 1; // 儲存當前渲染頁面組別 ( 每１０頁１組 )
let perPage = 20; // 儲存每頁顯示資料數
let totalPage = 0; // 儲存總頁數

//取得API資料
const getApiData = () => {
  axios
    .get(url)
    .then((res) => {
      data = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

//頁面載入時先取得所有資料
getApiData();

const renderData = () => {
  let result = "";
  showResult.textContent =
    search_type === "searching" ? `查看「${crop.value.trim()}」的比價結果` : "";
  if (filteredData.length === 0) {
    result += `<tr>
        <td colspan="7" class="text-center p-3">查詢不到當日的交易資訊QQ</td>
        </tr>
        `;
  } else {
    let currentPageData = filteredData.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    );
    currentPageData.forEach((item) => {
      result += `<tr>
            <td>${item.作物名稱}</td>
            <td>${item.市場名稱}</td>
            <td>${item.上價}</td>
            <td>${item.中價}</td>
            <td>${item.下價}</td>
            <td>${item.平均價}</td>
            <td>${item.交易量}</td>
          </tr>
            `;
    });
  }

  showList.innerHTML = result;
};

//依照輸入作物名稱搜尋
btnSearch.addEventListener("click", () => {
  resetSortSelect();
  searchCrop();
});

const searchCrop = () => {
  if (searchInput.value.trim() === "") {
    alert("請先輸入內容");
    return;
  }
  const type_btns = document.querySelectorAll(".button-group > .btn");
  type_btns.forEach((item) => {
    item.classList.remove("active");
  });
  filteredData = data.filter((item) => {
    if (item.作物名稱 !== null) {
      return item.作物名稱.match(searchInput.value.trim());
    }
  });
  search_type = "searching";
  currentPage = 1;
  loading();
  setTimeout(() => {
    renderData();
    renderPage();
  }, 500);
};

const loading = () => {
  showList.innerHTML = `
    <tr>
    <td colspan="7" class="text-center p-3">
      資料載入中...
    </td>
    </tr>
    `;
};

//依照選取類別搜尋
const changeType = () => {
  const type_btns = document.querySelectorAll(".button-group > .btn");
  type_btns.forEach((item) => {
    item.classList.remove("active");

    if (item.dataset.type === search_type) {
      item.classList.add("active");
    }
    filteredData = data.filter((item) => {
      return item.種類代碼 === search_type;
    });
  });
  currentPage = 1;
  renderData();
  renderPage();
};

btnGroup.addEventListener("click", (e) => {
  if (e.target.nodeName === "BUTTON") {
    search_type = e.target.dataset.type;
    searchInput.value = "";
    resetSortSelect();
    changeType();
  }
});

//依照選取數字排序
const changeSort = (sort_type, sort_method) => {
  switch (sort_method) {
    case "up":
      filteredData.sort((a, b) => {
        return b[sort_type] - a[sort_type];
      });
      break;
    case "down": {
      filteredData.sort((a, b) => {
        return a[sort_type] - b[sort_type];
      });
    }
  }
};

const resetSortSelect = () => {
  sortSelected.value = "default";
  sortMobile.value = "default";
};

sortSelected.addEventListener("change", (e) => {
  changeSort(e.target.value, "up");
  renderData();
});

//表頭箭頭遞增排序、遞減排序
sortAdvanced.addEventListener("click", (e) => {
  if (e.target.nodeName === "I") {
    resetSortSelect();
    let price = e.target.dataset.price;
    let sort = e.target.dataset.sort;
    changeSort(price, sort);
    renderData();
  }
});

//行動裝置畫面排序
sortMobile.addEventListener("change", (e) => {
  changeSort(e.target.value, "up");
  renderData();
});

// 渲染頁碼
function renderPage() {
  let str = "";
  let page = [];
  totalPage = Math.ceil(filteredData.length / perPage);
  currentPageGroup = Math.ceil(currentPage / 10);
  if (filteredData.length === 0) {
    str = "";
  } else {
    if (currentPageGroup == Math.ceil(totalPage / 10)) {
      for (let i = currentPageGroup * 10 - 9; i <= totalPage; i++) {
        page += `<li class="page" data-page=${i} onclick="pageChange(${i})">${i}</li>`;
      }
    } else {
      for (let i = currentPageGroup * 10 - 9; i <= currentPageGroup * 10; i++) {
        page += `<li class="page" data-page=${i} onclick="pageChange(${i})">${i}</li>`;
      }
    }
    str += `
    <li class="page-prev-ten" data-page=0 onclick="pageChange(currentPage - 10)"><i class="fas fa-angle-double-left"></i></li>
    <li class="page-prev" data-page=0 onclick="pageChange(currentPage - 1)"><i class="fas fa-angle-left"></i></li>
    ${page}
    <li class="page-next" data-page=0 onclick="pageChange(currentPage + 1)"><i class="fas fa-angle-right"></i></li>
    <li class="page-next-ten" data-page=0 onclick="pageChange(currentPage + 10)"><i class="fas fa-angle-double-right"></i></li>
    `;
  }
  pagination.innerHTML = str;
  pagination.classList.add("visible");
  pageStyle();
}

// 頁碼樣式變化
function pageStyle() {
  const pages = pagination.querySelectorAll(".page");
  pages[0].classList.add("page-active");
  pagination.querySelector(".page-prev").classList.remove("page-not-active");
  pagination.querySelector(".page-next").classList.remove("page-not-active");
  pagination
    .querySelector(".page-prev-ten")
    .classList.remove("page-not-active");
  pagination
    .querySelector(".page-next-ten")
    .classList.remove("page-not-active");

  if (currentPage == 1 && totalPage == 1) {
    pagination.querySelector(".page-prev").classList.add("page-not-active");
    pagination.querySelector(".page-next").classList.add("page-not-active");
    pagination.querySelector(".page-prev-ten").classList.add("page-not-active");
    pagination.querySelector(".page-next-ten").classList.add("page-not-active");
  } else if (currentPage == totalPage) {
    pagination.querySelector(".page-next").classList.add("page-not-active");
    pagination.querySelector(".page-next-ten").classList.add("page-not-active");
  } else if (currentPageGroup == 1 && currentPage == 1) {
    pagination.querySelector(".page-prev-ten").classList.add("page-not-active");
    pagination.querySelector(".page-prev").classList.add("page-not-active");
  } else if (currentPageGroup == 1) {
    pagination.querySelector(".page-prev-ten").classList.add("page-not-active");
  }
  pages.forEach((item) => {
    item.classList.remove("page-active");
    if (currentPage == item.getAttribute("data-page")) {
      item.classList.add("page-active");
    }
  });
}

// 變更頁碼
function pageChange(value) {
  if (value <= 0) {
    currentPage = 1;
  } else if (value >= totalPage) {
    currentPage = totalPage;
  } else {
    currentPage = value;
  }
  renderPage(data);
  pageStyle();
  renderData();
}
