#!/usr/bin/env python3
"""构建后清洗 .app 内的 config.json，使其符合 Lite Wearable schema。

背景（来自真机安装踩坑，详见 skill huawei-lite-watch-development
references/build-install-error-catalog.md）：
  hvigor 打包时会往 config.json 注入安装校验不通过的字段：
    - app.appEnvironments
    - app.apiVersion.compileSdkVersion
    - app.apiVersion.compileSdkType
  另外 module.package 可能残留 com.example.myapplication 默认值，
  文件可能带 UTF-8 BOM。以上任一存在，装表报「40.配置文件格式错误」。

用法: python3 clean_config_in_app.py <file.app> [more.app ...]
就地改写；打印每个文件的处理摘要。
"""
import glob
import io
import json
import os
import shutil
import sys
import tempfile
import zipfile

BAD_APP_KEYS = ("appEnvironments",)
BAD_API_KEYS = ("compileSdkVersion", "compileSdkType")


def fix_config_text(text: str) -> "tuple[str, list[str]]":
    cfg = json.loads(text.lstrip("\ufeff"))
    removed = []
    app = cfg.get("app") or {}
    for k in BAD_APP_KEYS:
        if k in app:
            app.pop(k)
            removed.append("app." + k)
    av = app.get("apiVersion")
    if isinstance(av, dict):
        for k in BAD_API_KEYS:
            if k in av:
                av.pop(k)
                removed.append("app.apiVersion." + k)
    dc = cfg.get("deviceConfig")
    if isinstance(dc, dict):
        dflt = dc.get("default")
        if isinstance(dflt, dict) and isinstance(dflt, dict):
            if "debug" in dflt:
                dflt.pop("debug")
                removed.append("deviceConfig.default.debug")
            if not dflt:
                dc.pop("default")  # 收敛为 {} —— 与已装成功包形态一致
    mod = cfg.get("module") or {}
    pkg = mod.get("package")
    if isinstance(pkg, str) and pkg.startswith("com.example"):
        mod["package"] = app.get("bundleName", pkg)
        removed.append("module.package->" + mod["package"])
    return json.dumps(cfg, ensure_ascii=False, separators=(",", ":")), removed


def rewrite_zip(src_bytes: bytes, config_fixer) -> "tuple[bytes, list[str]]":
    """重写一个 zip：对其中的 config.json 应用 fixer(text)->text 或 None。"""
    out = io.BytesIO()
    stats = []
    with zipfile.ZipFile(io.BytesIO(src_bytes), "r") as zin, \
            zipfile.ZipFile(out, "w") as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            if info.filename == "config.json" or info.filename.endswith("/config.json"):
                try:
                    new_text, removed = config_fixer(data.decode("utf-8"))
                    if removed:
                        data = new_text.encode("utf-8")
                        stats.extend(removed)
                except Exception as e:  # noqa: BLE001
                    print(f"  ! config.json 处理失败: {e}")
            new_info = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            new_info.compress_type = info.compress_type
            new_info.external_attr = info.external_attr
            new_info.create_system = info.create_system
            zout.writestr(new_info, data)
    return out.getvalue(), stats


def process_app(path: str) -> None:
    with open(path, "rb") as f:
        outer = f.read()
    # 外层 .app：内含 .hap；对每个 .hap 里的 config.json 清洗后再装回外层
    tmp_items = []  # (name, bytes)
    all_stats = []
    with zipfile.ZipFile(io.BytesIO(outer), "r") as z:
        for info in z.infolist():
            data = z.read(info.filename)
            if info.filename.endswith(".hap"):
                data, stats = rewrite_zip(data, fix_config_text)
                all_stats.extend(stats)
            tmp_items.append((info, data))

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zout:
        for info, data in tmp_items:
            ni = zipfile.ZipInfo(info.filename, date_time=info.date_time)
            ni.compress_type = info.compress_type
            ni.external_attr = info.external_attr
            ni.create_system = info.create_system
            zout.writestr(ni, data)
    # 校验能重新打开
    zipfile.ZipFile(io.BytesIO(buf.getvalue())).testzip()
    shutil.copyfile(path, path + ".bak")
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    os.remove(path + ".bak")
    print(f"清洗 {os.path.basename(path)}: {', '.join(all_stats) if all_stats else '无需改动'}")


def main() -> int:
    paths = []
    for pat in sys.argv[1:]:
        paths.extend(glob.glob(pat) or [pat])
    if not paths:
        print("用法: clean_config_in_app.py <file.app> ...")
        return 2
    for p in paths:
        process_app(p)
    return 0


if __name__ == "__main__":
    sys.exit(main())
