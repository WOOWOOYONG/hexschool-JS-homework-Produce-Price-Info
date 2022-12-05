const url = "https://hexschool.github.io/js-filter-data/data.json";
const showList = document.querySelector(".showList");
const showResult = document.querySelector(".show-result");
const search_input = document.querySelector("#crop");
const search_btn = document.querySelector(".search");
const btn_gruop = document.querySelector(".button-group");
const sort_selected = document.querySelector(".sort-select");
const sort_mobile = document.querySelector(".mobile-select");
const sort_advanced = document.querySelector(".js-sort-advanced");

let data = [];
let filteredData = [];
let search_type = "";

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
    filteredData.forEach((item) => {
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
search_btn.addEventListener("click", () => {
  resetSortSelect();
  searchCrop();
});

const searchCrop = () => {
  if (search_input.value.trim() === "") {
    alert("請先輸入內容");
    return;
  }
  const type_btns = document.querySelectorAll(".button-group > .btn");
  type_btns.forEach((item) => {
    item.classList.remove("active");
  });
  filteredData = data.filter((item) => {
    if (item.作物名稱 !== null) {
      return item.作物名稱.match(search_input.value.trim());
    }
  });
  search_type = "searching";
  loading();
  setTimeout(() => {
    renderData();
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

    renderData();
  });
};

btn_gruop.addEventListener("click", (e) => {
  if (e.target.nodeName === "BUTTON") {
    search_type = e.target.dataset.type;
    search_input.value = "";
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
  sort_selected.value = "default";
  sort_mobile.value = "default";
};

sort_selected.addEventListener("change", (e) => {
  changeSort(e.target.value, "up");
  renderData();
});

//表頭箭頭遞增排序、遞減排序
sort_advanced.addEventListener("click", (e) => {
  if (e.target.nodeName === "I") {
    resetSortSelect();
    let price = e.target.dataset.price;
    let sort = e.target.dataset.sort;
    changeSort(price, sort);
    renderData();
  }
});

//行動裝置畫面排序
sort_mobile.addEventListener("change", (e) => {
  changeSort(e.target.value, "up");
  renderData();
});
